// The sheet every animation page is drawn on: its title, two lines on what
// to watch and which keys to press, and four on how it works, with the
// coloured keys that step through the pages. Its text is the program's own
// codes, never text for the server to encode: the page's packets X/26 are
// its objects' and its controls', and nothing else is to be put in them.

import { Attribute, Colour, Screen, textColour } from "neoteletext-server-ts-protocol";

import { PAGES } from "../../site/page-numbers.ts";

/** The cells of a row, of which a colour takes the first. */
const COLUMNS = 40;
const MOST_CHARACTERS = COLUMNS - 1;
const TITLE_ROW = 1;
const WATCH_ROW = 3;
/** The rows a page draws its own matter on. */
export const FIRST_BODY_ROW = 6;
export const LAST_BODY_ROW = 17;
const HOW_ROW = 19;
const WATCH_LINES = 2;
const HOW_LINES = 4;
/** Printable ASCII that the English national option shows as itself, so that what is written is what is seen (EN 300 706 Table 36: it replaces # [ \ ] ^ _ ` { | } ~). */
const SHOWN_AS_WRITTEN = /^[ !"$-Za-z]*$/u;

/** What an animation page says of itself. */
export interface Said {
  readonly title: string;
  /** What to watch and which keys to press: at most two lines. */
  readonly watch: readonly string[];
  /** How it works: at most four lines. */
  readonly how: readonly string[];
}

/** A page number as a link's target names it: three hexadecimal digits. */
function digits(page: number): string {
  return page.toString(16).toUpperCase();
}

/** Writes `text` on `row` from `column` in `colour`, whose attribute takes that cell; `before` are attributes that follow the colour, such as flash. A line that does not fit, or would not show as written, stops the program when it starts: nothing is cut off silently. */
export function put(screen: Screen, row: number, column: number, colour: Colour, text: string, before: readonly number[] = []): void {
  if (column + 1 + before.length + text.length > COLUMNS || !SHOWN_AS_WRITTEN.test(text)) {
    throw new RangeError(`"${text}" does not fit row ${row} from column ${column}, or holds a character the page's set shows otherwise`);
  }
  screen.codes(row, column, [
    textColour(colour),
    ...before,
    // The text is ASCII, by the test above: a byte a character.
    ...Buffer.from(text, "ascii"),
  ]);
}

/** The pages, in the order the coloured keys step through them. */
const ORDER: readonly number[] = [PAGES.flash, PAGES.sprites, PAGES.cycling, PAGES.controls, PAGES.swap];

/** A page's sheet, for the page to draw its own matter on. */
export function sheet(page: number, said: Said): Screen {
  if (said.watch.length > WATCH_LINES || said.how.length > HOW_LINES || said.title.length > MOST_CHARACTERS - 1) {
    throw new RangeError(`${said.title}: a page has a title, ${WATCH_LINES} lines on what to watch and ${HOW_LINES} on how it works`);
  }
  const screen = new Screen();
  screen.header("ANIMATION");
  put(screen, TITLE_ROW, 0, Colour.Yellow, said.title, [Attribute.DoubleHeight]);
  for (const [index, line] of said.watch.entries()) {
    put(screen, WATCH_ROW + index, 0, Colour.White, line);
  }
  for (const [index, line] of said.how.entries()) {
    put(screen, HOW_ROW + index, 0, Colour.Cyan, line);
  }
  const at = ORDER.indexOf(page);
  const previous = ORDER.at(at - 1) ?? PAGES.animation;
  const next = ORDER[(at + 1) % ORDER.length] ?? PAGES.animation;
  screen.keyLink("red", digits(previous), "Previous");
  screen.keyLink("green", digits(next), "Next");
  screen.keyLink("yellow", digits(PAGES.animation), "Animation");
  screen.keyLink("cyan", digits(PAGES.index), "Index");
  screen.fastext([previous, next, PAGES.animation, PAGES.index]);
  screen.indexLink(PAGES.index);
  return screen;
}
