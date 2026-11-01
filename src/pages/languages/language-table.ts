// Every language page, in page order from PAGES.firstLanguage.

import type { Language } from "./language-sets.ts";
import { AFRICAN_LANGUAGES } from "./languages-african.ts";
import { OTHER_LANGUAGES } from "./languages-other.ts";
import { STANDARD_LANGUAGES } from "./languages-standard.ts";

export const LANGUAGES: readonly Language[] = [...STANDARD_LANGUAGES, ...AFRICAN_LANGUAGES, ...OTHER_LANGUAGES];
