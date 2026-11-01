// Page 820, the languages' index: every language by its English name, with
// a link to its page, over as many sub-pages as they take.

import { type Child, Component, Grid, h, PageLink, type PageSpec } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { languagePage } from "./language-files.ts";
import { LANGUAGES } from "./language-table.ts";

/** The names across a sub-page. */
const INDEX_COLUMNS = 2;
/** Twenty rows of two, the frame's body whole. */
const NAMES_A_SUB_PAGE = 40;

class LanguageIndex extends Component {
  override render(): Child {
    const links = LANGUAGES.map((language, place) => h(PageLink, { key: place, page: languagePage(place), label: language.name }));
    const sheets = Math.ceil(links.length / NAMES_A_SUB_PAGE);
    return Array.from({ length: sheets }, (_, sheet) =>
      frame(
        {
          look: LOOKS.languages,
          title: `Languages ${sheet + 1} of ${sheets}`,
          prompts: [
            ["Index", PAGES.index],
            ["First", languagePage(0)],
          ],
          hint: "Key a language's page, or click it",
        },
        h(Grid, { columns: INDEX_COLUMNS }, ...links.slice(sheet * NAMES_A_SUB_PAGE, (sheet + 1) * NAMES_A_SUB_PAGE)),
      ),
    );
  }
}

export function languageIndexPage(): PageSpec {
  return { page: PAGES.languages, title: "Languages", section: "Languages", root: () => h(LanguageIndex, {}) };
}
