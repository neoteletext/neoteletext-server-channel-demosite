// Every page of the site: the index, then each area's menu and pages.

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
