// Page 100, the index: what this is, and every area.

import { Colour } from "neoteletext-server-ts-protocol";
import { Clock, Columns, DoubleHeight, Gap, h, PageLink, type PageSpec, Ticker } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { PageMenu } from "../../parts/page-menu.ts";
import type { Area } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";

const TICKER_ITEMS = [
  "Every page here is drawn by the component library",
  "Key a page number, or click one",
  "The coloured keys follow the links at the bottom",
  "Games, music and pictures: all on teletext",
] as const;
/** How long each ticker item shows. */
const TICKER_MS = 4_000;
/** Fastext has four keys: the first four areas. */
const FASTEXT_KEYS = 4;
/** The clock's cells, at the right of the welcome line. */
const CLOCK_CELLS = 10;

export function indexPage(areas: readonly Area[]): PageSpec {
  return {
    page: PAGES.index,
    title: "Index",
    root: () =>
      frame(
        {
          look: LOOKS.index,
          title: "NeoTeletext Demo",
          prompts: areas.slice(0, FASTEXT_KEYS).map((area) => [area.name, area.menu] as const),
        },
        h(Columns, { widths: [null, CLOCK_CELLS] }, h(DoubleHeight, { text: "What teletext can be", foreground: Colour.Yellow }), h(Clock, { seconds: true })),
        h(Ticker, { items: TICKER_ITEMS, everyMs: TICKER_MS }),
        h(Gap, {}),
        h(PageMenu, { entries: areas.map((area) => ({ page: area.menu, label: area.name, about: area.about })) }),
        h(Gap, {}),
        h(PageLink, { page: PAGES.about, label: "About this demo", foreground: Colour.Green }),
      ),
  };
}
