// A language page's window: every character of the page's sets, on the rows
// its text leaves free, moved with the keys (language-page.ts). A page's set
// is the seven-bit designation of its X/28/0 packet, so what is shown here is
// the page's own decoding of each code, and no character is written out:
// the codes 2/0 to 7/F of the page's G0 set, of the second G0 set that ESC
// reaches where the set has one, and of the G2 set.
//
// G0 is in a row's own codes. G2 is reached only by packets X/26 (EN 300 706
// Table 29, mode 01111), so a row of G2 in view adds its triplets to those the
// page's text already has.

import { COLUMNS, Colour, mosaicColour, SPACE, textColour } from "neoteletext-server-ts-protocol";
import { FULL_BLOCK, thumb } from "neoteletext-server-ts-ui-components";
import { ESC_CODE, rowLine } from "./language-lines.ts";
import { hasSecondLatin, type SetName } from "./language-sets.ts";

/** A code table's sixteen codes to a row: its columns 2 to 7, which hold every character (clause 15.2). */
const CODES_A_ROW = 16;
const FIRST_CODE = 0x20;
const ROWS_A_TABLE = 6;
/** A character and the space after it, so that a mark or a joined letter stands alone. */
const CELLS_A_CODE = 2;
/** Cell 0 holds ESC on a row of the second set, cell 1 the row's colour. */
const FIRST_CODE_COLUMN = 2;
/** The scroll bar: its colour, then its cell. */
const BAR_COLOUR_COLUMN = COLUMNS - 2;
const LAST_ROW = 23;
/** With this many rows free, one is left blank between the text and the window. */
const ROWS_FOR_A_GAP = 4;

/** A table of the page's sets, each in a colour of its own, since a set without Latin letters cannot name them. */
type Table = "first" | "second" | "supplementary";
const TABLE_COLOURS: Readonly<Record<Table, Colour>> = { first: Colour.White, second: Colour.Green, supplementary: Colour.Yellow };

/** One row of a table: its table and the row's first code. */
interface TableRow {
  readonly table: Table;
  readonly first: number;
}

/** Table 28, row address group: Set Active Position on a row. */
const ROW_ADDRESS_BASE = 40;
const MODE_SET_ACTIVE_POSITION = 0b00100;
/** Table 29, column address group: a G2 character. */
const MODE_G2 = 0b01111;
/** Annex A.3: the Termination Marker. */
const TERMINATION_ADDRESS = 63;
const MODE_TERMINATION = 0b11111;
const TERMINATION_DATA = 0b111_1111;
/** Clause 12.3.1: a triplet's address is 6 bits, its mode 5 and its data 7. */
const MODE_SHIFT = 6;
const DATA_SHIFT = 11;
const MODE_MASK = 0b1_1111;
const ADDRESS_MASK = 0b11_1111;
/** The packet local enhancement data travels in, its 13 triplets to a packet, and 16 packets (clause 12.3). */
const ENHANCEMENT_PACKET = "OL,26,";
const TRIPLETS_A_PACKET = 13;
const LOCAL_TRIPLETS = 16 * TRIPLETS_A_PACKET;
/** A packed character: bit 6 set, six bits of a triplet below it (the engine's TTI_PACKED_CHARACTER_BASE). */
const PACKED_BASE = 0x40;
const PACKED_BITS = 6;
const PACKED_MASK = 0b11_1111;
const CHARACTERS_A_TRIPLET = 3;

function tripletOf(address: number, mode: number, data: number): number {
  return address | (mode << MODE_SHIFT) | (data << DATA_SHIFT);
}

const TERMINATION = tripletOf(TERMINATION_ADDRESS, MODE_TERMINATION, TERMINATION_DATA);

/** Every row of a page's tables, in order. */
function tableRows(set: SetName): readonly TableRow[] {
  const tables: readonly Table[] = hasSecondLatin(set) ? ["first", "second", "supplementary"] : ["first", "supplementary"];
  return tables.flatMap((table) => Array.from({ length: ROWS_A_TABLE }, (_, row) => ({ table, first: FIRST_CODE + row * CODES_A_ROW })));
}

/** Whether a line of `tti` is a display row with something on it. */
function displayRow(line: string): number | undefined {
  const row = /^OL,(\d+),(.+)$/u.exec(line);
  const number = Number(row?.[1]);
  return row !== null && number <= LAST_ROW && row[2]?.trim() !== "" ? number : undefined;
}

/** Where the window goes on a page: the rows under its text. */
export function windowOf(tti: string): { readonly first: number; readonly shown: number } {
  const last = Math.max(...tti.split("\n").map((line) => displayRow(line) ?? 0));
  const free = LAST_ROW - last;
  const first = last + (free >= ROWS_FOR_A_GAP ? 2 : 1);
  return { first, shown: LAST_ROW - first + 1 };
}

/** The first table row a window can start at. */
export function lastTop(tti: string, set: SetName): number {
  return Math.max(0, tableRows(set).length - windowOf(tti).shown);
}

/** The columns of a row's sixteen characters, and each one's code. */
function cellsOf(row: TableRow): readonly (readonly [column: number, code: number])[] {
  return Array.from({ length: CODES_A_ROW }, (_, place) => [FIRST_CODE_COLUMN + place * CELLS_A_CODE, row.first + place]);
}

/** A row of the window, on the scroll bar's block or beside it. */
function rowCodes(row: TableRow, onBlock: boolean): number[] {
  const codes = Array.from({ length: COLUMNS }, () => SPACE);
  if (row.table === "second") {
    codes[0] = ESC_CODE;
  }
  codes[1] = textColour(TABLE_COLOURS[row.table]);
  if (row.table !== "supplementary") {
    for (const [column, code] of cellsOf(row)) {
      codes[column] = code;
    }
  }
  codes[BAR_COLOUR_COLUMN] = mosaicColour(Colour.Cyan);
  codes[BAR_COLOUR_COLUMN + 1] = onBlock ? FULL_BLOCK : SPACE;
  return codes;
}

/** A row of G2 on page row `pageRow`: its position, then a triplet for each character. */
function supplementaryTriplets(row: TableRow, pageRow: number): number[] {
  return row.table === "supplementary"
    ? [tripletOf(ROW_ADDRESS_BASE + pageRow, MODE_SET_ACTIVE_POSITION, 0), ...cellsOf(row).map(([column, code]) => tripletOf(column, MODE_G2, code))]
    : [];
}

/** The triplets of a packed line, in order, from its 39 characters after the designation code. */
function packedTriplets(line: string): number[] {
  const codes = Array.from(line.slice(ENHANCEMENT_PACKET.length + 1), (character) => (character.codePointAt(0) ?? 0) & PACKED_MASK);
  return Array.from({ length: TRIPLETS_A_PACKET }, (_, at) => {
    const place = at * CHARACTERS_A_TRIPLET;
    return (codes[place] ?? 0) | ((codes[place + 1] ?? 0) << PACKED_BITS) | ((codes[place + 2] ?? 0) << (2 * PACKED_BITS));
  });
}

/** Whether a triplet ends the local enhancement data. */
function isTermination(value: number): boolean {
  return (value & ADDRESS_MASK) === TERMINATION_ADDRESS && ((value >> MODE_SHIFT) & MODE_MASK) === MODE_TERMINATION;
}

/**
 * Triplets as packed OL,26 lines from designation code 0, ended by a Termination
 * Marker, which also fills the last packet. There is always one: a scroll
 * changes the packets of a page the receiver holds, and packets a shorter
 * group does not send again stay there until the marker ends them.
 */
function packedLines(triplets: readonly number[]): string[] {
  const ended = [...triplets, TERMINATION];
  if (ended.length > LOCAL_TRIPLETS) {
    throw new RangeError(`a page holds ${LOCAL_TRIPLETS} triplets of local enhancement data, not ${ended.length}`);
  }
  return Array.from({ length: Math.ceil(ended.length / TRIPLETS_A_PACKET) }, (_, packet) => {
    const values = Array.from({ length: TRIPLETS_A_PACKET }, (_unused, at) => ended[packet * TRIPLETS_A_PACKET + at] ?? TERMINATION);
    const characters = values.flatMap((value) =>
      Array.from({ length: CHARACTERS_A_TRIPLET }, (_unused, place) => PACKED_BASE | ((value >> (place * PACKED_BITS)) & PACKED_MASK)),
    );
    return `${ENHANCEMENT_PACKET}${String.fromCodePoint(PACKED_BASE | packet, ...characters)}`;
  });
}

/** `tti` with its window, the table rows from `top` in view. */
export function withWindow(tti: string, set: SetName, top: number): string {
  const rows = tableRows(set);
  const { first, shown } = windowOf(tti);
  const inView = rows.slice(top, top + shown);
  const block = thumb(top, rows.length, shown, shown);
  const windowLines = inView.map((row, place) => rowLine(first + place, rowCodes(row, place >= block.start && place < block.start + block.length)));
  const lines = tti.split("\n").filter((line) => line !== "");
  const own = lines.filter((line) => line.startsWith(ENHANCEMENT_PACKET)).flatMap((line) => packedTriplets(line));
  const ending = own.findIndex((value) => isTermination(value));
  const text = ending === -1 ? own : own.slice(0, ending);
  const added = inView.flatMap((row, place) => supplementaryTriplets(row, first + place));
  const kept = lines.filter((line) => !line.startsWith(ENHANCEMENT_PACKET));
  const fastext = kept.findIndex((line) => line.startsWith("OL,24,"));
  return `${[...kept.slice(0, fastext), ...windowLines, kept[fastext] ?? "", ...packedLines([...text, ...added]), ...kept.slice(fastext + 1)].join("\n")}\n`;
}
