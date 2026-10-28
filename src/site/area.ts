// An area of the site: its name, look and menu page, and its pages, each
// with a few words for the menu. The index lists the areas and each menu
// its pages, from here.

import type { PageSpec, Prompts } from "neoteletext-server-ts-ui-components";
import type { Look } from "./looks.ts";
import { PAGES } from "./page-numbers.ts";
import type { Site } from "./site.ts";

/** One page of an area, with what the menu says of it. */
export interface AreaPage {
  readonly spec: PageSpec;
  readonly about: string;
}

export interface Area {
  readonly name: string;
  /** A few words for the index. */
  readonly about: string;
  readonly look: Look;
  readonly menu: number;
  pages(site: Site): readonly AreaPage[];
  /** The area's own menu page, when it is not the list of its pages. */
  menuPage?(site: Site): PageSpec;
  /** Pages the menu does not list, which its pages link to: the news stories, a picture. */
  unlisted?(site: Site): readonly PageSpec[];
}

/** Fastext has four coloured keys. */
const MOST_PROMPTS = 4;

/** The prompts of an area's pages: its menu, the index, and up to two more. */
export function areaPrompts(menu: readonly [label: string, page: number], ...others: Prompts): Prompts {
  return [menu, ["Index", PAGES.index] as const, ...others].slice(0, MOST_PROMPTS);
}
