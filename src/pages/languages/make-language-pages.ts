// Makes the language pages' TTI files from the language table, so that a
// rebuild reproduces them:
//
//   node src/pages/languages/make-language-pages.ts --neottx PATH
//
// `neottx write-text` writes a page in a named set: its X/28/0 designation,
// the order of right-to-left rows, the mark rows of Thai and Lao, and the
// X/26 marks. It writes no colours, and a row starts at column 0, so each
// line goes to it with stand-in cells in front, and those cells are then
// replaced by the row's attributes: the columns X/26 addresses do not move. A
// right-to-left row needs no stand-ins, since it ends at the right edge.
// Each input line is kept short enough to stay one row: what comes back is
// checked, and a page that is not as planned stops the run.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { Colour, COLUMNS, pageText, readTtiPages, SPACE, textColour } from "neoteletext-server-ts-protocol";
import { PAGES } from "../../site/page-numbers.ts";
import { languageFile, languagePage, TTI_FOLDER } from "./language-files.ts";
import { attributesOf, inputOf, KINDS, type Kind, type Layout, layoutOf, type Line, linesOf, STAND_INS } from "./language-lines.ts";
import { type Language, SET_DESIGNATIONS, type SetName } from "./language-sets.ts";
import { LANGUAGES } from "./language-table.ts";

const GROUP_SHIFT = 3;
const OPTION_MASK = 0b111;
const DESIGNATION_MASK = 0x7f;
/** The groups of neoteletext's own sets, each with Latin English as its second G0 set, which ESC reaches. */
const SECOND_LATIN_GROUPS: ReadonlySet<number> = new Set([0b0101, 0b0111, 0b1001, 0b1011, 0b1100]);
/** Table 4, triplet 1: the default G0 and G2 designation starts at bit 8. */
const DESIGNATION_SHIFT = 7;
/** A triplet's fields (EN 300 706 clause 12.3.1): address 6 bits, mode 5, data 7. */
const MODE_SHIFT = 6;
const DATA_SHIFT = 11;

/** ESC, which switches a row to the second G0 set (EN 300 706 clause 15.3). */
const ESC_CODE = 0x1b;
/** What TTI's escape form adds to a control code (the engine's REQ-INP-013). */
const ESCAPE_OFFSET = 0x40;
const FIRST_DISPLAY_ROW = 1;
const FASTEXT_ROW = 24;
/** The Fastext prompts' columns: each prompt's colour code, from where it starts. */
const PROMPT_WIDTHS = [8, 8, 15] as const;
/** The characters of a prompt that must have their ASCII codes in a set without Latin letters. */
const PROMPT_SIGNS = "-+0123456789";
/** The word on a page whose sets have Latin letters. */
const INDEX_WORD = "Index";

/** A row's codes from an OL line's text, its escapes undone, padded to the row's width. */
function rowCodes(text: string): number[] {
  const codes: number[] = [];
  for (let at = 0; at < text.length; at += 1) {
    const code = text.codePointAt(at) ?? SPACE;
    if (code === ESC_CODE) {
      at += 1;
      codes.push((text.codePointAt(at) ?? ESCAPE_OFFSET) - ESCAPE_OFFSET);
    } else {
      codes.push(code);
    }
  }
  return [...codes, ...Array.from({ length: COLUMNS - codes.length }, () => SPACE)];
}

/** A row's codes as an OL line's text, in the escape form: every control code as ESC and the code plus the offset. */
function rowText(codes: readonly number[]): string {
  return codes
    .map((code) => (code < SPACE ? String.fromCodePoint(ESC_CODE, code + ESCAPE_OFFSET) : String.fromCodePoint(code)))
    .join("")
    .trimEnd();
}

/** The neottx this run writes with. */
function writer(neottx: string, scratch: string): (set: SetName, page: number, lines: readonly string[]) => string {
  const input = join(scratch, "page.txt");
  const output = join(scratch, "page.tti");
  return (set, page, lines) => {
    writeFileSync(input, `${lines.join("\n")}\n`, "utf8");
    execFileSync(neottx, ["write-text", "--set", set, "--page", pageText(page), input, output], { stdio: "pipe" });
    return readFileSync(output, "latin1");
  };
}

type Write = ReturnType<typeof writer>;

/** The rows of `text` by row number, 1 to 23. */
function displayRows(text: string): Map<number, number[]> {
  const rows = new Map<number, number[]>();
  for (const line of text.split("\n")) {
    const found = /^OL,(\d+),(.*)$/su.exec(line);
    const number = Number(found?.[1]);
    if (found !== null && number >= FIRST_DISPLAY_ROW && number < FASTEXT_ROW) {
      rows.set(number, rowCodes(found[2] ?? ""));
    }
  }
  return rows;
}

/** Stops the run unless `row` opens with `wanted` where its attributes go. */
function expectLead(row: readonly number[] | undefined, wanted: number, cells: number, name: string): void {
  if (row?.slice(0, cells).every((code) => code === wanted) !== true) {
    throw new Error(`${name}: a row does not open with ${cells} cells of ${wanted.toString(16)}: a line wrapped, or the set moved a stand-in`);
  }
}

/** Puts the attributes on a left-to-right or right-to-left page, whose lines are its rows. */
function colourRows(rows: Map<number, number[]>, lines: readonly Line[], place: number, language: Language, layout: Layout): void {
  if (Math.max(...rows.keys()) !== lines.length) {
    throw new Error(`${language.name}: ${lines.length} lines became ${Math.max(...rows.keys())} rows`);
  }
  lines.forEach((line, index) => {
    const row = rows.get(index + FIRST_DISPLAY_ROW);
    if (line.kind === null || row === undefined) {
      return;
    }
    const attributes = attributesOf(line.kind, place, layout);
    expectLead(row, layout === "right-to-left" ? SPACE : STAND_INS[line.kind], attributes.length, language.name);
    row.splice(0, attributes.length, ...attributes);
  });
}

/** Puts the attributes on a marked page: a letter row has its stand-ins, and a row of marks takes the colours of the letters under it. */
function colourMarkedRows(rows: Map<number, number[]>, lines: readonly Line[], place: number, language: Language): void {
  const numbers = [...rows.keys()].toSorted((a, b) => a - b);
  const stands = new Map(KINDS.map((kind) => [STAND_INS[kind], kind]));
  const letterRows = numbers.filter((number) => stands.has(rows.get(number)?.[0] ?? SPACE));
  if (letterRows.length !== lines.length) {
    throw new Error(`${language.name}: ${lines.length} lines became ${letterRows.length} rows of letters`);
  }
  let kept: Kind | undefined;
  for (const number of numbers.toReversed()) {
    const row = rows.get(number) ?? [];
    const lead = row[0] ?? SPACE;
    const kind = stands.get(lead) ?? kept ?? "letters";
    kept = kind;
    const attributes = attributesOf(kind, place, "marked");
    expectLead(row, stands.has(lead) ? STAND_INS[kind] : SPACE, attributes.length, language.name);
    row.splice(0, attributes.length, ...attributes);
  }
}

/** The codes of ASCII text. */
function ascii(text: string): number[] {
  return Array.from(text, (character) => character.codePointAt(0) ?? SPACE);
}

/** The codes of the language's own word for an index, in a set whose signs for the prompts must have their ASCII codes, or the prompts would not read. */
function wordCodes(language: Language, place: number, write: Write): number[] {
  const word = language.index ?? INDEX_WORD;
  const text = write(language.set, languagePage(place), [`${word} ${PROMPT_SIGNS}`]);
  const codes = rowCodes(/^OL,1,(.*)$/mu.exec(text)?.[1] ?? "");
  const cells = Array.from(word).length;
  if (String.fromCodePoint(...codes.slice(cells + 1, cells + 1 + PROMPT_SIGNS.length)) !== PROMPT_SIGNS) {
    throw new Error(`${language.name}: its set does not have the prompts' signs at their ASCII codes`);
  }
  return codes.slice(0, cells);
}

/** Row 24: the coloured keys' prompts, in Latin where the page's sets have it: the language before, the one after, the languages' index and the site's. */
function promptRow(language: Language, place: number, write: Write): number[] {
  const secondLatin = SECOND_LATIN_GROUPS.has(SET_DESIGNATIONS[language.set] >> GROUP_SHIFT);
  const word = language.index === undefined ? ascii(INDEX_WORD) : wordCodes(language, place, write);
  const before = place === 0 ? PAGES.languages : languagePage(place - 1);
  const after = place === LANGUAGES.length - 1 ? PAGES.index : languagePage(place + 1);
  const prompts = [
    [textColour(Colour.Red), ...ascii(`-${pageText(before)}`)],
    [textColour(Colour.Green), ...ascii(`+${pageText(after)}`)],
    [textColour(Colour.Yellow), ...word, SPACE, ...ascii(pageText(PAGES.languages))],
  ];
  const row = secondLatin ? [ESC_CODE] : [];
  prompts.forEach((prompt, index) => {
    row.push(...prompt, ...Array.from({ length: (PROMPT_WIDTHS[index] ?? 0) - prompt.length }, () => SPACE));
  });
  row.push(textColour(Colour.Cyan), ...ascii(pageText(PAGES.index)));
  return row;
}

/** A row as an OL line. */
function rowLine(number: number, codes: readonly number[]): string {
  return `OL,${number},${rowText(codes)}`;
}

/** Whether a line of TTI is a display row's, not a packed line's. */
function isRow(line: string): boolean {
  return /^OL,(\d|1\d|2[0-3]),/u.test(line);
}

/** The page's finished TTI: `written` with its rows coloured and row 24 added. */
function finished(written: string, rows: ReadonlyMap<number, readonly number[]>, prompts: readonly number[]): string {
  const lines = written.split("\n").filter((line) => line !== "");
  const first = lines.findIndex((line) => isRow(line));
  const body = [...rows.entries()].toSorted(([a], [b]) => a - b).map(([number, codes]) => rowLine(number, codes));
  return `${[...lines.slice(0, first), ...body, rowLine(FASTEXT_ROW, prompts), ...lines.slice(first).filter((line) => !isRow(line))].join("\n")}\n`;
}

/** Stops the run unless the page says what the table says of its set. */
function expectDesignation(text: string, language: Language): void {
  const [page] = readTtiPages(text);
  const packet = page?.content.packets.find((line) => line.packet === "x28");
  const triplet = packet !== undefined && "triplets" in packet ? packet.triplets[0] : undefined;
  const value = triplet === undefined ? 0 : triplet.address | (triplet.mode << MODE_SHIFT) | (triplet.data << DATA_SHIFT);
  const wanted = SET_DESIGNATIONS[language.set];
  if (((value >> DESIGNATION_SHIFT) & DESIGNATION_MASK) !== wanted || page?.content.character_set.national_option !== (wanted & OPTION_MASK)) {
    throw new Error(`${language.name}: the page does not designate ${language.set}`);
  }
}

function makePage(language: Language, place: number, write: Write): string {
  const layout = layoutOf(language.set);
  const lines = linesOf(language, place, layout);
  const written = write(
    language.set,
    languagePage(place),
    lines.map((line) => inputOf(line, place, layout, language.set)),
  );
  const rows = displayRows(written);
  if (layout === "marked") {
    colourMarkedRows(rows, lines, place, language);
  } else {
    colourRows(rows, lines, place, language, layout);
  }
  const text = finished(written, rows, promptRow(language, place, write));
  expectDesignation(text, language);
  return text;
}

function main(): void {
  const { values } = parseArgs({ options: { neottx: { type: "string" } }, strict: true });
  if (values.neottx === undefined) {
    throw new Error("--neottx PATH is required");
  }
  const scratch = join("tmp", "language-pages");
  mkdirSync(scratch, { recursive: true });
  mkdirSync(TTI_FOLDER, { recursive: true });
  const write = writer(values.neottx, scratch);
  LANGUAGES.forEach((language, place) => {
    writeFileSync(languageFile(place), makePage(language, place, write), "latin1");
  });
  process.stderr.write(`made ${LANGUAGES.length} language pages\n`);
}

main();
