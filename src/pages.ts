// Every page of the site: the index, then each area's menu and pages.
//
// One copy of the site serves every language (REQ-2218): a page but a
// language page is drawn in English for each viewer, its title naming the
// viewer's language and its samples written in it, from the `language`
// cookie the language page sets. A language page is in its own language,
// one copy for everyone.

import { ENGLISH, type PageSpec } from "neoteletext-server-ts-ui-components";
import { areaMenuPage } from "./pages/home/area-menu-page.ts";
import { indexPage } from "./pages/home/index-page.ts";
import { AREAS } from "./site/areas.ts";
import type { Site } from "./site/site.ts";

/** `spec` drawn for each viewer in English, with what is theirs in their language; a page in a language of its own as it is. */
function forEachViewer(spec: PageSpec): PageSpec {
  return spec.language === undefined ? { ...spec, language: ENGLISH, perViewer: true } : spec;
}

export function pages(site: Site): PageSpec[] {
  const specs: PageSpec[] = [indexPage(AREAS)];
  AREAS.forEach((area, place) => {
    const listed = area.pages(site);
    const next = AREAS[(place + 1) % AREAS.length] ?? area;
    specs.push(area.menuPage?.(site) ?? areaMenuPage(area, listed, next), ...listed.map((page) => page.spec), ...(area.unlisted?.(site) ?? []));
  });
  return specs.map((spec) => forEachViewer(spec));
}
