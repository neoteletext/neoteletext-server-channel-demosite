// Every page of the site: the index, then each area's menu and pages.
//
// One copy of the site serves every language (REQ-2218): a page names no
// language of its own, so the library draws it in each viewer's, from the
// `language` cookie the page on 899 sets, the site's words as text of that
// language (main.ts, the library's stand-in). A language page is in its own
// language, one copy for everyone.

import type { PageSpec } from "neoteletext-server-ts-ui-components";
import { areaMenuPage } from "./pages/home/area-menu-page.ts";
import { indexPage } from "./pages/home/index-page.ts";
import { AREAS } from "./site/areas.ts";
import type { Site } from "./site/site.ts";

export function pages(site: Site): PageSpec[] {
  const specs: PageSpec[] = [indexPage(AREAS)];
  AREAS.forEach((area, place) => {
    const listed = area.pages(site);
    const next = AREAS[(place + 1) % AREAS.length] ?? area;
    specs.push(area.menuPage?.(site) ?? areaMenuPage(area, listed, next), ...listed.map((page) => page.spec), ...(area.unlisted?.(site) ?? []));
  });
  return specs;
}
