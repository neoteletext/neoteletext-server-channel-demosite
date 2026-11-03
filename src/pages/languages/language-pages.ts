// The language pages, a page each from PAGES.firstLanguage, each in its own
// language (language-page.ts), and the page that chooses the viewer's
// language for the rest of the site (language-choice.ts).

import { h, type PageSpec, type Prompts } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { languagePage } from "./language-files.ts";
import { LanguageChoice } from "./language-choice.ts";
import { LanguagePage } from "./language-page.ts";
import { LANGUAGES } from "./language-table.ts";

/** A page's coloured keys: the language before, the one after, the languages' index and the site's. */
function promptsOf(place: number): Prompts {
  const before = place === 0 ? PAGES.languages : languagePage(place - 1);
  const after = place === LANGUAGES.length - 1 ? PAGES.index : languagePage(place + 1);
  return [
    ["Before", before],
    ["Next", after],
    ["Languages", PAGES.languages],
    ["Index", PAGES.index],
  ];
}

/** Every language's page, in its language. */
export function languagePages(): PageSpec[] {
  return LANGUAGES.map((language, place) => ({
    page: languagePage(place),
    title: language.name,
    language: language.tag,
    root: () =>
      h(LanguagePage, {
        entry: language,
        background: LOOKS.languages.background,
        foreground: LOOKS.languages.foreground,
        prompts: promptsOf(place),
        index: PAGES.index,
      }),
  }));
}

/** The page that chooses the viewer's language; selected with `?language=TAG`, it chooses that one and goes to the index. */
export function languageChoicePage(): PageSpec {
  return {
    page: PAGES.chooseLanguage,
    title: "Choose a language",
    root: (params) =>
      frame(
        {
          look: LOOKS.languages,
          title: "Choose a language",
          prompts: [
            ["Index", PAGES.index],
            ["Languages", PAGES.languages],
            ["Cookies", PAGES.cookies],
          ],
        },
        h(LanguageChoice, { home: PAGES.index, ...(params === undefined ? {} : { params }) }),
      ),
  };
}
