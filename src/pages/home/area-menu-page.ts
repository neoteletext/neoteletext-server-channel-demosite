// An area's menu, on its N00 page: each of its pages and what is there.

import { h, type PageSpec } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { PageMenu } from "../../parts/page-menu.ts";
import type { Area, AreaPage } from "../../site/area.ts";
import { PAGES } from "../../site/page-numbers.ts";

/** Fastext has four keys: the index, the next area, and the first two of the area's pages. */
const LINKED_PAGES = 2;

export function areaMenuPage(area: Area, pages: readonly AreaPage[], next: Area): PageSpec {
  return {
    page: area.menu,
    title: area.name,
    section: area.name,
    root: () =>
      frame(
        {
          look: area.look,
          title: area.name,
          prompts: [["Index", PAGES.index], [next.name, next.menu], ...pages.slice(0, LINKED_PAGES).map((page) => [page.spec.title, page.spec.page] as const)],
        },
        h(PageMenu, { entries: pages.map((page) => ({ page: page.spec.page, label: page.spec.title, about: page.about })) }),
      ),
  };
}
