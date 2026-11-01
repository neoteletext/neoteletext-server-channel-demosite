// The lines of a language page: what goes to `neottx write-text`, and the
// attributes in front of each line. A row starts at column 0, so a line goes
// with a stand-in for each attribute cell, which replaces them afterwards.

import { Attribute, Colour, COLUMNS, textColour } from "neoteletext-server-ts-protocol";
import type { Language, SetName } from "./language-sets.ts";

/** A line's part of the page. */
export type Kind = "band" | "headline" | "body" | "letters";

/** How a set lays its rows out. */
export type Layout = "left-to-right" | "right-to-left" | "marked";

/** One line of the page, or a blank row. */
export interface Line {
  readonly kind: Kind | null;
  readonly text: string;
}

const RIGHT_TO_LEFT: ReadonlySet<SetName> = new Set(["hebrew", "persian", "urdu", "pashto", "sindhi", "sorani", "uyghur", "balochi", "arabic"]);
const MARKED: ReadonlySet<SetName> = new Set(["thai", "lao"]);

/** The stand-in in front of each kind of line, one for each so that a row says what it is: a digit, the one thing every left-to-right set keeps at its ASCII code (punctuation can go, and is then reached by ESC). */
export const STAND_INS: Readonly<Record<Kind, number>> = { band: 0x31, headline: 0x32, body: 0x33, letters: 0x34 };
export const KINDS: readonly Kind[] = ["band", "headline", "body", "letters"];
/** The Lao set has Lao digits at the digits' codes (WST90 Figure 33), and they are what is written to reach them. */
const LAO_DIGIT_OFFSET = 0x0ed0 - 0x30;

/** The title bands, in turn down the pages: background and title colour. */
const BANDS = [
  { background: Colour.Blue, foreground: Colour.Yellow },
  { background: Colour.Red, foreground: Colour.White },
  { background: Colour.Magenta, foreground: Colour.Yellow },
] as const;

/** Text colours: a line's attributes are its colour alone, but for the band's. */
const TEXT_COLOURS: Readonly<Record<Exclude<Kind, "band">, Colour>> = { headline: Colour.Yellow, body: Colour.White, letters: Colour.Cyan };

export function layoutOf(set: SetName): Layout {
  if (RIGHT_TO_LEFT.has(set)) {
    return "right-to-left";
  }
  return MARKED.has(set) ? "marked" : "left-to-right";
}

/** The attributes in front of a line of `kind`: a row's first cells. A marked row cannot be double height: its marks are a row of their own. */
export function attributesOf(kind: Kind, place: number, layout: Layout): number[] {
  if (kind !== "band") {
    return [textColour(TEXT_COLOURS[kind])];
  }
  const band = BANDS[place % BANDS.length] ?? BANDS[0];
  const start = [textColour(band.background), Attribute.NewBackground, textColour(band.foreground)];
  return layout === "marked" ? start : [...start, Attribute.DoubleHeight];
}

/** The cells `text` takes: a combining mark takes none. */
function cellsOf(text: string): number {
  return Array.from(text.replaceAll(/\p{Mn}/gu, "")).length;
}

/** `text` as lines of at most `width` cells, broken at spaces. */
function wrapped(text: string, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const joined = line === "" ? word : `${line} ${word}`;
    if (cellsOf(joined) <= width) {
      line = joined;
    } else {
      lines.push(line);
      line = word;
    }
  }
  return [...lines, line];
}

/** The page's lines, top to bottom. */
export function linesOf(language: Language, place: number, layout: Layout): Line[] {
  const part = (kind: Kind, text: string): Line[] => {
    const width = COLUMNS - attributesOf(kind, place, layout).length;
    return text.split("\n").flatMap((each) => wrapped(each, width).map((line) => ({ kind, text: line })));
  };
  // A row of a marked page holds marks, and a blank line there would take two rows: only the marks' rows part its lines.
  const blank: Line[] = layout === "marked" ? [] : [{ kind: null, text: "" }];
  return [
    ...part("band", language.own),
    // The band's second row, under its double height.
    ...blank,
    ...blank,
    ...part("headline", language.headline),
    ...blank,
    ...part("body", language.text),
    ...blank,
    ...part("letters", language.letters),
  ];
}

/** What `neottx write-text` is given for `line`. */
export function inputOf(line: Line, place: number, layout: Layout, set: SetName): string {
  if (line.kind === null || layout === "right-to-left") {
    return line.text;
  }
  const standIn = String.fromCodePoint(STAND_INS[line.kind] + (set === "lao" ? LAO_DIGIT_OFFSET : 0));
  return standIn.repeat(attributesOf(line.kind, place, layout).length) + line.text;
}
