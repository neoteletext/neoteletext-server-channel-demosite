// Where the language pages are: each one's number, keyed in decimal as every
// page here is.

import { pageText } from "neoteletext-server-ts-protocol";
import { PAGES } from "../../site/page-numbers.ts";

/** How many languages an index page lists: twenty rows of two, the frame's body whole. */
export const NAMES_AN_INDEX = 40;

/** The hexadecimal digits of a page number. */
const PAGE_RADIX = 16;

/** The page of the language at `place`: a number a viewer can key, so its digits are decimal ones. */
export function languagePage(place: number): number {
  return Number.parseInt(String(Number(pageText(PAGES.firstLanguage)) + place), PAGE_RADIX);
}
