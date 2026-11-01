// The languages: a teletext page in every language the engine has a set for.

import type { Area } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { languageIndexPage } from "./language-index-page.ts";
import { languagePages } from "./language-pages.ts";

export const LANGUAGE_AREA: Area = {
  name: "Languages",
  about: "A page in every language we show",
  look: LOOKS.languages,
  menu: PAGES.languages,
  pages: () => [],
  menuPage: languageIndexPage,
  unlisted: languagePages,
};
