// Page 101, the headlines: each a link to its story's page.

import { Colour } from "neottx-server-ts-protocol";
import { Badges, Gap, h, Headline, type PageSpec } from "neottx-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { servicesPrompts } from "./prompts.ts";
import { STORIES } from "./stories.ts";

/** The lines each headline takes. */
const HEADLINE_LINES = 2;

/** The page of the story at `place`: from 111, one each. */
export function storyPageAt(place: number): number {
  return PAGES.firstStory + place;
}

export function newsPage(): PageSpec {
  return {
    page: PAGES.news,
    title: "News",
    root: () =>
      frame(
        { look: LOOKS.services, title: "News", prompts: servicesPrompts(["Weather", PAGES.weather], ["Markets", PAGES.markets]) },
        h(Badges, { badges: [{ text: "LIVE", background: Colour.Red, flash: true }], text: "The headlines: key a page or click one" }),
        h(Gap, {}),
        ...STORIES.map((story, place) => h(Headline, { key: place, title: story.headline, page: storyPageAt(place), lines: HEADLINE_LINES })),
      ),
  };
}
