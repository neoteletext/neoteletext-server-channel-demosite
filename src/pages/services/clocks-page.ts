// Page 106, the clocks: the time in large digits, the world's cities, and
// a countdown to the new year.

import { Gap, h, type PageSpec } from "neottx-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { NewYear } from "./new-year.ts";
import { servicesPrompts } from "./prompts.ts";
import { WorldClock } from "./world-clock.ts";

export function clocksPage(): PageSpec {
  return {
    page: PAGES.clocks,
    title: "World clock",
    root: () =>
      frame(
        { look: LOOKS.services, title: "World clock", prompts: servicesPrompts(["Weather", PAGES.weather], ["Calendar", PAGES.calendar]) },
        h(WorldClock, {}),
        h(Gap, {}),
        h(NewYear, {}),
      ),
  };
}
