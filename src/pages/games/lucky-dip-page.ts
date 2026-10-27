// Page 305, the lucky dip: a wheel that spins to one of the news stories.

import { type Article, h, type PageSpec, Roulette } from "neottx-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { SOUNDS } from "../../parts/sounds.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { storyPageAt } from "../services/news-page.ts";
import { STORIES } from "../services/stories.ts";
import { gamesPrompts } from "./prompts.ts";

/** The stories as the wheel's articles: each goes to its page. */
const ARTICLES: readonly Article[] = STORIES.map((story, place) => ({
  page: storyPageAt(place),
  title: story.headline,
  writer: story.section,
  date: 0,
  summary: story.blocks[0]?.text ?? "",
  blocks: story.blocks,
  tags: [story.section],
  link: "",
}));

export function luckyDipPage(): PageSpec {
  return {
    page: PAGES.luckyDip,
    title: "Lucky dip",
    root: () =>
      frame(
        { look: LOOKS.games, title: "Lucky dip", prompts: gamesPrompts(["Snake", PAGES.snake], ["News", PAGES.news]) },
        h(Roulette, { articles: ARTICLES, tick: SOUNDS.blip, done: SOUNDS.right }),
      ),
  };
}
