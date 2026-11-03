// A language page (REQ-2154, REQ-2155): built of the library's components
// in the page's language, which the server encodes. The language's name in
// itself heads the page on the title band, which stays; under it a
// scrolling view holds the Declaration's title and text, the language's
// letters and every character of the page's set (character-tables.ts); a
// page of Wikipedia's text has the attribution its licence asks for under
// the view, always in sight. The view moves by the arrows, Page Up, Page Down, Home, End, the
// wheel and its bar, each viewer's own (the library's ScrollView).

import { cellsOf, Colour, COLUMNS, type LanguageTag } from "neoteletext-server-ts-protocol";
import {
  BAR_CELLS,
  BODY_ROWS,
  type Child,
  Component,
  type Element,
  ENGLISH,
  Frame,
  h,
  type Prompts,
  ScrollView,
  Text,
} from "neoteletext-server-ts-ui-components";
import { tablesOf } from "./character-tables.ts";
import type { Language } from "./language-sets.ts";
import { breaksOf } from "./sample-text.ts";

/** A line's cells: the row less the view's bar and the cell of the line's colour. */
const LINE_CELLS = COLUMNS - BAR_CELLS - 1;

/** What CC BY-SA 4.0 section 3(a)(1) asks of a page of Wikipedia's text, with the revision's address (`Language.article`): the source, that the text was changed, the licence and its address (DEC-1987 item 11). */
const WIKIPEDIA_CREDIT = "Text: Wikipedia, changed. CC BY-SA 4.0";
const LICENCE_ADDRESS = "creativecommons.org/licenses/by-sa/4.0";

/** The colour of each part of the page, as the ready-made pages had them (DEC-1987). */
const COLOURS = {
  headline: Colour.Yellow,
  text: Colour.White,
  letters: Colour.Cyan,
  attribution: Colour.Green,
} as const;

/** A blank row between the parts. */
function blank(key: string): Element {
  return h(Text, { key, text: "", height: 1 });
}

/** The tables' colours, told apart by colour since a set without Latin letters cannot name them: G0 white, the second G0 set green, G2 yellow (DEC-1987 item 13). */
const TABLE_COLOURS = { first: Colour.White, second: Colour.Green, supplementary: Colour.Yellow } as const;

/** The rows of the set's tables, each in its table's colour, the second set's in English, which it is. */
function tableUnits(language: Language): Element[] {
  const tables = tablesOf(language.set);
  const rows = (table: keyof typeof TABLE_COLOURS, extra: { readonly language?: LanguageTag }): Element[] =>
    tables[table].map((row, at) => h(Text, { key: `${table} ${at}`, text: row, foreground: TABLE_COLOURS[table], height: 1, ...extra }));
  return [blank("before tables"), ...rows("first", {}), ...rows("second", { language: ENGLISH }), ...rows("supplementary", {})];
}

export interface LanguagePageProps {
  /** The language's page in the table; `language`, which every element takes, is its tag. */
  readonly entry: Language;
  /** The title band's colours: the languages' magazine's. */
  readonly background: Colour;
  readonly foreground: Colour;
  /** Row 24: the language before, the one after, the languages' index, the site's. */
  readonly prompts: Prompts;
  readonly index: number;
}

/** `text` as lines of at most `width` cells, broken at spaces; a line break in it parts lines. */
export function linesOf(text: string, width: number): string[] {
  return text.split("\n").flatMap((paragraph) => {
    const lines: string[] = [];
    let line = "";
    for (const part of breaksOf(paragraph)) {
      const joined = line === "" ? part : `${line} ${part}`;
      if (line !== "" && cellsOf(joined) > width) {
        lines.push(line);
        line = part;
      } else {
        line = joined;
      }
    }
    if (line !== "") {
      lines.push(line);
    }
    return lines;
  });
}

/** The lines of a page of Wikipedia's text that credit it. */
function attributionOf(language: Language): string[] {
  if (language.source !== "wikipedia") {
    return [];
  }
  if (language.article === undefined) {
    throw new Error(`${language.name}: a text from Wikipedia names the revision it came from`);
  }
  return [WIKIPEDIA_CREDIT, language.article, LICENCE_ADDRESS];
}

/** The lines of one part of the page, `text`, in its colour. */
function partLines(name: keyof typeof COLOURS, text: string): Element[] {
  return linesOf(text, LINE_CELLS).map((line, at) => h(Text, { key: `${name} ${at}`, text: line, foreground: COLOURS[name] }));
}

export class LanguagePage extends Component<LanguagePageProps> {
  /** The view's units, top to bottom: each a line of text, or a blank row. */
  #units(): Element[] {
    const language = this.props.entry;
    return [
      ...(language.headline === "" ? [] : [...partLines("headline", language.headline), blank("after headline")]),
      ...(language.text === "" ? [] : [...partLines("text", language.text), blank("after text")]),
      ...partLines("letters", language.letters),
      ...tableUnits(language),
    ];
  }

  override render(): Child {
    const { entry, background, foreground, prompts, index } = this.props;
    const attribution = attributionOf(entry);
    const shown = BODY_ROWS - attribution.length;
    return h(
      Frame,
      { title: entry.own, background, foreground, prompts, index },
      h(ScrollView, { shown, autoFocus: true }, ...this.#units()),
      // Under the view, always in sight and the row's whole width, which the licence's address needs: Latin letters on every page, Sorani's included, so in English.
      ...attribution.map((line, at) => h(Text, { key: `attribution ${at}`, text: line, foreground: COLOURS.attribution, language: ENGLISH })),
    );
  }
}
