// A language page's window: everything under its heading, moved with the keys
// (language-page.ts). The heading, rows 1 and 2, and the prompts on row 24
// stay; rows 3 to 22 show the page's text, its letters, any attribution and
// then every character of its sets; row 23 says where the window is.
//
// The characters are the codes 2/0 to 7/F of the page's G0 set, of the second
// G0 set that ESC reaches where the set has one, and of the G2 set, shown by
// the page's own designation, so no character is written out. G0 is in a row's
// own codes. G2 and the text's marks are reached only by packets X/26, which
// address rows (EN 300 706 Tables 28 and 29), so as the window moves each row
// in view takes its triplets with it, addressed to where it now is.

import { COLUMNS, Colour, mosaicColour, SPACE, textColour } from "neoteletext-server-ts-protocol";
import { FULL_BLOCK, thumb } from "neoteletext-server-ts-ui-components";
import { ESC_CODE, layoutOf, rowText } from "./language-lines.ts";
import { hasSecondLatin, type SetName } from "./language-sets.ts";

/** The rows the window takes, and the row of its position under them. */
export const FIRST_ROW = 3;
const LAST_ROW = 22;
const POSITION_ROW = 23;
export const ROWS_SHOWN = LAST_ROW - FIRST_ROW + 1;
/** A code table's sixteen codes to a row: its columns 2 to 7, which hold every character (clause 15.2). */
const CODES_A_ROW = 16;
const FIRST_CODE = 0x20;
const ROWS_A_TABLE = 6;
/** A character and the space after it, so that a mark or a joined letter stands alone. */
const CELLS_A_CODE = 2;
/** Cell 0 holds ESC on a row of the second set, cell 1 the row's colour. */
const FIRST_CODE_COLUMN = 2;
/** A marked page's rows come in pairs, the marks over their letters, and move in pairs. */
const ROWS_IN_A_MARKED_STEP = 2;

/** A table of the page's sets, each in a colour of its own, since a set without Latin letters cannot name them. */
type Table = "first" | "second" | "supplementary";
const TABLE_COLOURS: Readonly<Record<Table, Colour>> = { first: Colour.White, second: Colour.Green, supplementary: Colour.Yellow };

/** Table 28: rows are addressed from 40, row 24 at 40 itself, and Set Active Position moves to one. */
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
/** A row of the page in a TTI file: its number and its text. */
const DISPLAY_ROW = /^OL,(\d+),(.*)$/su;

function tripletOf(address: number, mode: number, data: number): number {
  return address | (mode << MODE_SHIFT) | (data << DATA_SHIFT);
}

const TERMINATION = tripletOf(TERMINATION_ADDRESS, MODE_TERMINATION, TERMINATION_DATA);

/** One row of what the window moves over: its text in TTI, and the X/26 data of its cells, without the row's own address. */
interface WindowRow {
  readonly text: string;
  readonly triplets: readonly number[];
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

/** The page's local enhancement data, by the row each triplet acts on, with each row's addresses taken out. */
function tripletsByRow(lines: readonly string[]): ReadonlyMap<number, readonly number[]> {
  const triplets = lines.filter((line) => line.startsWith(ENHANCEMENT_PACKET)).flatMap((line) => packedTriplets(line));
  const ending = triplets.findIndex((value) => isTermination(value));
  const rows = new Map<number, number[]>();
  let row = 0;
  for (const value of ending === -1 ? triplets : triplets.slice(0, ending)) {
    const address = value & ADDRESS_MASK;
    if (address >= ROW_ADDRESS_BASE) {
      row = address - ROW_ADDRESS_BASE;
      rows.set(row, rows.get(row) ?? []);
    } else {
      rows.get(row)?.push(value);
    }
  }
  return rows;
}

/** The address triplet of page row `row`, then its row's triplets; nothing for a row without any. */
function addressed(row: number, triplets: readonly number[]): number[] {
  return triplets.length === 0 ? [] : [tripletOf(ROW_ADDRESS_BASE + row, MODE_SET_ACTIVE_POSITION, 0), ...triplets];
}

/** The rows of the code tables, in order. */
function tableRows(set: SetName): WindowRow[] {
  const tables: readonly Table[] = hasSecondLatin(set) ? ["first", "second", "supplementary"] : ["first", "supplementary"];
  return tables.flatMap((table) =>
    Array.from({ length: ROWS_A_TABLE }, (_, row) => {
      const first = FIRST_CODE + row * CODES_A_ROW;
      const places = Array.from({ length: CODES_A_ROW }, (_unused, place) => ({ column: FIRST_CODE_COLUMN + place * CELLS_A_CODE, code: first + place }));
      const codes: number[] = Array.from({ length: COLUMNS }, () => SPACE);
      codes[0] = table === "second" ? ESC_CODE : SPACE;
      codes[1] = textColour(TABLE_COLOURS[table]);
      if (table !== "supplementary") {
        for (const { column, code } of places) {
          codes[column] = code;
        }
      }
      return { text: rowText(codes), triplets: table === "supplementary" ? places.map(({ column, code }) => tripletOf(column, MODE_G2, code)) : [] };
    }),
  );
}

/** Everything the window moves over: the page's rows from the first under its heading, a blank row, and the code tables. */
function windowRows(lines: readonly string[], set: SetName): WindowRow[] {
  const texts = new Map<number, string>();
  for (const line of lines) {
    const [, number, text] = DISPLAY_ROW.exec(line) ?? [];
    if (number !== undefined && text !== undefined && Number(number) >= FIRST_ROW && Number(number) <= POSITION_ROW) {
      texts.set(Number(number), text);
    }
  }
  const triplets = tripletsByRow(lines);
  const last = Math.max(FIRST_ROW, ...texts.keys());
  const page = Array.from({ length: last - FIRST_ROW + 1 }, (_, place) => ({
    text: texts.get(FIRST_ROW + place) ?? "",
    triplets: triplets.get(FIRST_ROW + place) ?? [],
  }));
  return [...page, { text: "", triplets: [] }, ...tableRows(set)];
}

/** How many rows the window moves by: a marked page's in pairs. */
export function rowStep(set: SetName): number {
  return layoutOf(set) === "marked" ? ROWS_IN_A_MARKED_STEP : 1;
}

/** The first row a window of the page in `tti` can start at. */
export function lastTop(tti: string, set: SetName): number {
  const step = rowStep(set);
  return Math.ceil(Math.max(0, windowRows(tti.split("\n"), set).length - ROWS_SHOWN) / step) * step;
}

/** Row 23: the window's place, in mosaics, which every set has. */
function positionLine(top: number, total: number): string {
  const track = COLUMNS - 1;
  const { start, length } = thumb(top, total, track, ROWS_SHOWN);
  const cells = Array.from({ length: track }, (_, at) => (at >= start && at < start + length ? FULL_BLOCK : SPACE));
  return `OL,${POSITION_ROW},${rowText([mosaicColour(Colour.Cyan), ...cells])}`;
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

/** Whether a line of TTI is a row the window takes the place of. */
function inWindow(line: string): boolean {
  const number = Number(DISPLAY_ROW.exec(line)?.[1] ?? 0);
  return number >= FIRST_ROW && number <= POSITION_ROW;
}

/** `tti` with its window, the rows from `top` in view. */
export function withWindow(tti: string, set: SetName, top: number): string {
  const lines = tti.split("\n").filter((line) => line !== "");
  const rows = windowRows(lines, set);
  const inView = rows.slice(top, top + ROWS_SHOWN);
  const kept = lines.filter((line) => !line.startsWith(ENHANCEMENT_PACKET) && !inWindow(line));
  const fastext = kept.findIndex((line) => line.startsWith("OL,24,"));
  const rowsDrawn = [...inView.map((row, place) => `OL,${FIRST_ROW + place},${row.text}`), positionLine(top, rows.length)];
  const byRow = tripletsByRow(lines);
  const heading = [...byRow.entries()].filter(([row]) => row > 0 && row < FIRST_ROW).flatMap(([row, triplets]) => addressed(row, triplets));
  const below = inView.flatMap((row, place) => addressed(FIRST_ROW + place, row.triplets));
  return `${[...kept.slice(0, fastext), ...rowsDrawn, kept[fastext] ?? "", ...packedLines([...heading, ...below]), ...kept.slice(fastext + 1)].join("\n")}\n`;
}
