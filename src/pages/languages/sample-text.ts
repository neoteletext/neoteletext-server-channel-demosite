// The text a page shows in the viewer's language (REQ-2218 item 2): no
// translation is written for the site, so what a component shows as its
// sample (a list's items, a heading, a ticker, a paragraph) is taken from
// the language's own page: its name in itself, the Declaration's title and
// text, and its letters. The site's own captions stay in English.
//
// A viewer with no language chosen, or with English, sees the site's own
// English samples, so an English page looks as it always has.

import { COLUMNS, type Language as ServerLanguage, type LanguageTag } from "neoteletext-server-ts-protocol";
import { cells, fit, type Services } from "neoteletext-server-ts-ui-components";
import type { Language } from "./language-sets.ts";
import { LANGUAGES } from "./language-table.ts";

/** The channel's language: a viewer who chose none sees the site's own samples. */
export const ENGLISH_TAG: LanguageTag = "en";

/** The tags the server lists that no page is written in, and the page whose text each shows: the same script and sets. */
const SAME_TEXT: Readonly<Partial<Record<LanguageTag, LanguageTag>>> = {
  ja: "ja-Hrkt",
  "ja-Hira": "ja-Hrkt",
  "tzm-Tfng": "zgh",
};

/** A sentence ends at one of these and a space. */
const SENTENCE_END = /(?<=[.!?։።؟।۔])\s+/u;
/** A word's punctuation at its ends, which a list item does without. */
const WORD_EDGES = /^[\p{P}\s]+|[\p{P}\s]+$/gu;

/** One language's sample text, from its page. */
export interface Sample {
  /** The language it is written in. */
  readonly tag: LanguageTag;
  /** Its name in English, as the site names it. */
  readonly name: string;
  /** Its name in itself. */
  readonly own: string;
  /** The Declaration's title, or its own name where the page has no text. */
  readonly headline: string;
  /** The Declaration's sentences, or its own name where the page has no text. */
  readonly sentences: readonly string[];
  /** The Declaration's words, each once, in the order they come. A Thai or Lao "word" is a stretch between the page's breaks. */
  readonly words: readonly string[];
  /** Its letters, each alone. */
  readonly letters: readonly string[];
  /** A line of it takes three rows, its marks on the rows around it (Thai, Lao): a control of one row cannot show it (TODO-2229 item 2). */
  readonly marked: boolean;
}

/** The page whose text `tag` shows, or undefined for a tag no page is written in. */
export function pageOf(tag: LanguageTag): Language | undefined {
  const wanted = SAME_TEXT[tag] ?? tag;
  return LANGUAGES.find((language) => language.tag === wanted);
}

/** A Thai or Lao page breaks its text between words with a line break, having no spaces to break at. */
function isMarked(server: ServerLanguage | undefined): boolean {
  return server !== undefined && server.markRows > 0;
}

/** The stretches of `text` that may start a line: Thai and Lao at the page's breaks, the rest at spaces. */
export function breaksOf(text: string, marked: boolean): string[] {
  return (marked ? text.split("\n") : text.split(/\s+/u)).filter((part) => part !== "");
}

function sampleFrom(language: Language, tag: LanguageTag, server: ServerLanguage | undefined): Sample {
  const marked = isMarked(server);
  const sentences = marked ? breaksOf(language.text, true) : language.text.split(SENTENCE_END).filter((sentence) => sentence !== "");
  const words = [...new Set(breaksOf(language.text, marked).map((word) => word.replaceAll(WORD_EDGES, "")))].filter((word) => word !== "");
  return {
    tag,
    name: language.name,
    own: language.own,
    headline: language.headline === "" ? language.own : language.headline,
    sentences: sentences.length === 0 ? [language.own] : sentences,
    words: words.length === 0 ? breaksOf(language.own, marked) : words,
    letters: breaksOf(language.letters, false),
    marked,
  };
}

/**
 * What a page shows its viewer in their language, `tag`, one of the
 * server's `languages`: the samples of that language's page, or the
 * site's own English ones (null) for English and a tag no page shows.
 */
export class Sampler {
  readonly sample: Sample | null;

  constructor(tag: LanguageTag, languages: readonly ServerLanguage[]) {
    const page = tag === ENGLISH_TAG ? undefined : pageOf(tag);
    this.sample =
      page === undefined
        ? null
        : sampleFrom(
            page,
            tag,
            languages.find((language) => language.tag === tag),
          );
  }

  /** The props that put display text in the sample's language: none for the site's own English. */
  get display(): { readonly language?: LanguageTag } {
    return this.sample === null ? {} : { language: this.sample.tag };
  }

  /** The props that put a control's text (a row of a list, a menu's entry, a field) in the sample's language: none where a line of it takes three rows. */
  get control(): { readonly language?: LanguageTag } {
    return this.sample === null || this.sample.marked ? {} : { language: this.sample.tag };
  }

  /** `english`, or what `pick` takes from the sample. */
  text(english: string, pick: (sample: Sample) => string): string {
    return this.sample === null ? english : pick(this.sample);
  }

  /** `english`, or as many of the sample's `pool` in turn, round again when it has fewer. */
  list(english: readonly string[], pool: (sample: Sample) => readonly string[]): string[] {
    const sample = this.sample;
    if (sample === null) {
      return [...english];
    }
    const from = pool(sample);
    return english.map((each, place) => from[place % from.length] ?? each);
  }

  /** As `text`, for a control: English where a line of the sample takes three rows. */
  controlText(english: string, pick: (sample: Sample) => string): string {
    return this.sample?.marked === true ? english : this.text(english, pick);
  }

  /** As `list`, for a control's rows: English where a line of the sample takes three rows. */
  controlList(english: readonly string[], pool: (sample: Sample) => readonly string[]): string[] {
    return this.sample?.marked === true ? [...english] : this.list(english, pool);
  }
}

/** The cells the title band gives its title: the row less its background's two cells, Double Height and the ink's two, and the Black Background that ends it (the library's TitleBand). */
const TITLE_CELLS = COLUMNS - 5;
/** Between a page's title and its language's name. */
const TITLE_JOIN = " - ";

/** The name the site gives the language `tag`: its page's, else the server's, else the tag. */
function nameOf(tag: LanguageTag, languages: readonly ServerLanguage[]): string {
  return pageOf(tag)?.name ?? languages.find((language) => language.tag === tag)?.name ?? tag;
}

/** A page's title with the viewer's language named after it, the title cut so the name is always seen (REQ-2218: each page shows its language). */
export function titleIn(title: string, tag: LanguageTag, languages: readonly ServerLanguage[]): string {
  const suffix = `${TITLE_JOIN}${nameOf(tag, languages)}`;
  return `${fit(title, Math.max(0, TITLE_CELLS - cells(suffix)))}${suffix}`;
}

/** What a page shows the viewer it is drawn for, by their language; the site's own English on the copy every viewer shares. */
export function samplerFor(services: Pick<Services, "session" | "language" | "languages">): Sampler {
  return new Sampler(services.language(services.session), services.languages());
}
