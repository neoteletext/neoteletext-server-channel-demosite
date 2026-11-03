// The text every page is drawn in for a viewer in another language
// (REQ-2218 item 2, DEC-2233): no translation is written for the channel, so
// the library draws each of its words as letters of the language's own page
// (the library's stand-in), the Declaration's title and text, so every
// component shows that language's script. A viewer with no language chosen,
// or with English, sees the channel's words as written.

import type { LanguageTag } from "neoteletext-server-ts-protocol";
import type { Language } from "./language-sets.ts";
import { LANGUAGES } from "./language-table.ts";

/** The channel's language: a viewer who chose none sees its words as written. */
export const ENGLISH_TAG: LanguageTag = "en";

/** The tags the server lists that no page is written in, and the page whose text each shows: the same script and sets. */
const SAME_TEXT: Readonly<Partial<Record<LanguageTag, LanguageTag>>> = {
  ja: "ja-Hrkt",
  "ja-Hira": "ja-Hrkt",
  "tzm-Tfng": "zgh",
};

/** The page whose text `tag` shows, or undefined for a tag no page is written in. */
export function pageOf(tag: LanguageTag): Language | undefined {
  const wanted = SAME_TEXT[tag] ?? tag;
  return LANGUAGES.find((language) => language.tag === wanted);
}

/** The stretches of `text` that may start a line: Thai and Lao at the page's breaks, the rest at spaces. */
export function breaksOf(text: string, marked: boolean): string[] {
  return (marked ? text.split("\n") : text.split(/\s+/u)).filter((part) => part !== "");
}

/**
 * The text the library draws the site's own words as for a viewer in
 * `tag` (the library's stand-in, ComponentChannelOptions.standIn): its
 * page's Declaration, title and text, or its name in itself and its letters
 * where the page has no text; nothing for English and for a tag no page is
 * written in, whose viewers see the words as written.
 */
export function standInText(tag: LanguageTag): string | undefined {
  const page = tag === ENGLISH_TAG ? undefined : pageOf(tag);
  if (page === undefined) {
    return undefined;
  }
  return [page.headline, page.text].join(" ").trim() === "" ? `${page.own} ${page.letters}` : `${page.headline} ${page.text}`;
}
