// The language pages, a page each from PAGES.firstLanguage: the ready-made
// TTI that make-language-pages.ts writes, since a page's character set is
// what the component library cannot choose, with a window of every character
// of its sets (language-page.ts).

import type { FastextLinks } from "neoteletext-server-ts-protocol";
import { h, type PageSpec } from "neoteletext-server-ts-ui-components";
import { readSmall } from "../../pictures/read-small.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { languageFile, languagePage } from "./language-files.ts";
import { LanguagePage } from "./language-page.ts";
import { LANGUAGES } from "./language-table.ts";

/** A page of TTI with every enhancement packet is a few kilobytes. */
const LONGEST_PAGE = 16 * 1024;

/** A page's coloured keys, as its row 24 says: the language before, the one after, the languages' index and the site's. */
function linksOf(place: number): FastextLinks {
  const before = place === 0 ? PAGES.languages : languagePage(place - 1);
  const after = place === LANGUAGES.length - 1 ? PAGES.index : languagePage(place + 1);
  return [before, after, PAGES.languages, PAGES.index];
}

/** Every language's page. A page missing from the folder stops the channel: the pages are part of the program. */
export function languagePages(): PageSpec[] {
  return LANGUAGES.map((language, place) => {
    const tti = readSmall(languageFile(place), "latin1", LONGEST_PAGE);
    if (tti === undefined) {
      throw new Error(`the page of ${language.name} is missing: ${languageFile(place)}`);
    }
    return {
      page: languagePage(place),
      title: language.name,
      root: () => h(LanguagePage, { tti, set: language.set, fastext: linksOf(place), index: PAGES.index }),
    };
  });
}
