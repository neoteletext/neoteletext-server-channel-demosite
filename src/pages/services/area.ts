// Services, magazine 1: the news, live pages and the long read.

import type { Area } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { servicesPages } from "./listed-pages.ts";
import { storyPageAt } from "./news-page.ts";
import { STORIES } from "./stories.ts";
import { storyPage } from "./story-page.ts";

export const SERVICES: Area = {
  name: "Services",
  about: "News, weather, markets, TV, clocks",
  look: LOOKS.services,
  menu: PAGES.services,
  pages: servicesPages,
  unlisted: () => STORIES.map((story, place) => storyPage(story, storyPageAt(place))),
};
