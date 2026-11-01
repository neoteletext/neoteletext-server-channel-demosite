// Every language page, in page order from PAGES.firstLanguage: alphabetical by
// its name in English, so that the page numbers, the indexes and the channel's
// contents all read in that order.

import type { Language } from "./language-sets.ts";
import { AFRICAN_LANGUAGES } from "./languages-african.ts";
import { OTHER_LANGUAGES } from "./languages-other.ts";
import { STANDARD_LANGUAGES } from "./languages-standard.ts";

export const LANGUAGES: readonly Language[] = [...STANDARD_LANGUAGES, ...AFRICAN_LANGUAGES, ...OTHER_LANGUAGES].toSorted((a, b) =>
  a.name.localeCompare(b.name, "en"),
);
