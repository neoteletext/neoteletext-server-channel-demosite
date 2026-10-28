// Page 104, the TV guide: tonight's programmes on four channels, a tab each.

import { Colour } from "neoteletext-server-ts-protocol";
import { type Child, Component, DataTable, h, type PageSpec, TabView } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { servicesPrompts } from "./prompts.ts";

const CHANNELS = [
  {
    name: "One",
    programmes: [
      ["18:00", "News and weather"],
      ["18:30", "Regional news"],
      ["19:00", "Quiz of the week"],
      ["19:30", "Gardening hour"],
      ["20:30", "Drama: The Lighthouse"],
      ["21:30", "Late film: Night Train"],
    ],
  },
  {
    name: "Two",
    programmes: [
      ["18:00", "Snooker: the final"],
      ["20:00", "Science: Mosaic Worlds"],
      ["21:00", "Comedy: Page Faults"],
      ["21:30", "Newsnight"],
    ],
  },
  {
    name: "Three",
    programmes: [
      ["18:00", "Cartoons"],
      ["18:30", "Soap: Fastext Lane"],
      ["19:00", "Music: Live at the Hall"],
      ["20:00", "Documentary: Signals"],
      ["21:00", "Film: The Long Read"],
    ],
  },
  {
    name: "Four",
    programmes: [
      ["18:00", "Teletext: the story"],
      ["19:00", "Cookery: Ten Minute Meals"],
      ["19:30", "Travel: Coast to Coast"],
      ["20:30", "Arts review"],
    ],
  },
] as const;
const TIME_CELLS = 7;
const TITLE_CELLS = 31;
/** The programmes shown: the most any channel has. */
const SHOWN = Math.max(...CHANNELS.map((channel) => channel.programmes.length));

class Guide extends Component {
  override render(): Child {
    return h(
      TabView,
      { tabs: CHANNELS.map((channel) => channel.name), style: "chips", initial: 0 },
      ...CHANNELS.map((channel) =>
        h(DataTable, {
          key: channel.name,
          shown: SHOWN,
          selectable: true,
          columns: [
            { title: "Time", width: TIME_CELLS, foreground: Colour.Yellow },
            { title: "Programme", width: TITLE_CELLS },
          ],
          rows: channel.programmes,
        }),
      ),
    );
  }
}

export function guidePage(): PageSpec {
  return {
    page: PAGES.guide,
    title: "TV guide",
    root: () =>
      frame(
        { look: LOOKS.services, title: "TV guide: tonight", prompts: servicesPrompts(["Calendar", PAGES.calendar], ["Clocks", PAGES.clocks]) },
        h(Guide, {}),
      ),
  };
}
