// Page 100, the index: what this is, the page that chooses the viewer's
// language, and every area (About is on the services' menu). The heading and the ticker are samples:
// in the viewer's language, its name in itself and the Declaration's
// sentences (REQ-2218 item 2).

import { Colour } from "neoteletext-server-ts-protocol";
import { type Child, Clock, Columns, Component, DoubleHeight, h, PageLink, type PageSpec, Rows, Ticker } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { PageMenu } from "../../parts/page-menu.ts";
import type { Area } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { samplerFor } from "../languages/sample-text.ts";

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
/** The link to the page that chooses a language, beside the ticker: its page number, a space and its label, with a cell for its colour. */
const LANGUAGE_LINK_CELLS = 14;

class IndexBody extends Component<{ readonly areas: readonly Area[] }> {
  override render(): Child {
    const sampler = samplerFor(this.services);
    return h(
      Rows,
      {},
      h(
        Columns,
        { widths: [null, CLOCK_CELLS] },
        h(DoubleHeight, { text: sampler.text("What teletext can be", (sample) => sample.own), foreground: Colour.Yellow, ...sampler.display }),
        h(Clock, { seconds: true }),
      ),
      h(
        Columns,
        { widths: [null, LANGUAGE_LINK_CELLS] },
        // A ticker is one row: Thai and Lao, whose line takes three, keep the English.
        h(Ticker, { items: sampler.controlList(TICKER_ITEMS, (sample) => sample.sentences), everyMs: TICKER_MS, ...sampler.control }),
        h(PageLink, { page: PAGES.chooseLanguage, label: "Language", foreground: Colour.Yellow }),
      ),
      h(PageMenu, { entries: this.props.areas.map((area) => ({ page: area.menu, label: area.name, about: area.about })) }),
    );
  }
}

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
        h(IndexBody, { areas }),
      ),
  };
}
