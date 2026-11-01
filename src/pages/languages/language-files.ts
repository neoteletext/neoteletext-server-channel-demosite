// Where the language pages are: each one's number, keyed in decimal as every
// page here is, and its ready-made TTI file.

import { fileURLToPath } from "node:url";

import { pageText } from "neoteletext-server-ts-protocol";
import { PAGES } from "../../site/page-numbers.ts";

/** How many languages an index page lists: twenty rows of two, the frame's body whole. */
export const NAMES_AN_INDEX = 40;

/** The hexadecimal digits of a page number. */
const PAGE_RADIX = 16;

/** The folder of the pages `make-language-pages.ts` writes. */
export const TTI_FOLDER = fileURLToPath(new URL("tti", import.meta.url));

/** The page of the language at `place`: a number a viewer can key, so its digits are decimal ones. */
export function languagePage(place: number): number {
  return Number.parseInt(String(Number(pageText(PAGES.firstLanguage)) + place), PAGE_RADIX);
}

/** The TTI file of the language at `place`. */
export function languageFile(place: number): string {
  return `${TTI_FOLDER}/${pageText(languagePage(place))}.tti`;
}
