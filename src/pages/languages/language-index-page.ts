// The languages' index: every language by its English name, with a link to
// its page, on two pages. Not sub-pages: a channel is not told which sub-page
// a viewer has up, so a click would land on the first sub-page's link.

import { type Child, Component, Grid, h, PageLink, type PageSpec } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { languagePage, NAMES_AN_INDEX } from "./language-files.ts";
import { LANGUAGES } from "./language-table.ts";

/** The names across an index page. */
const INDEX_COLUMNS = 2;

interface LanguageIndexProps {
  readonly title: string;
  /** The first language it lists, by place in the table. */
  readonly from: number;
  /** The other index page's prompt. */
  readonly other: readonly [label: string, page: number];
}

class LanguageIndex extends Component<LanguageIndexProps> {
  override render(): Child {
    const { title, from, other } = this.props;
    const links = LANGUAGES.slice(from, from + NAMES_AN_INDEX).map((language, place) =>
      h(PageLink, { key: place, page: languagePage(from + place), label: language.name }),
    );
    return frame(
      {
        look: LOOKS.languages,
        title,
        prompts: [["Index", PAGES.index], other, ["First", languagePage(0)]],
        hint: "Key a language's page, or click it",
      },
      h(Grid, { columns: INDEX_COLUMNS }, ...links),
    );
  }
}

export function languageIndexPage(): PageSpec {
  return {
    page: PAGES.languages,
    title: "Languages",
    section: "Languages",
    root: () => h(LanguageIndex, { title: "Languages", from: 0, other: ["More", PAGES.moreLanguages] }),
  };
}

export function moreLanguagesPage(): PageSpec {
  return {
    page: PAGES.moreLanguages,
    title: "More languages",
    root: () => h(LanguageIndex, { title: "More languages", from: NAMES_AN_INDEX, other: ["Back", PAGES.languages] }),
  };
}
