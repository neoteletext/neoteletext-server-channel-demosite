// A news story's page: its text over as many sub-pages as it needs.

import { Colour, COLUMNS } from "neoteletext-server-ts-protocol";
import { articleLines, Document, h, type PageSpec } from "neoteletext-server-ts-ui-components";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { servicesPrompts } from "./prompts.ts";
import type { Story } from "./stories.ts";

/** The story's lines: a cell short of the page, for each line's colour. */
const TEXT_CELLS = COLUMNS - 1;

export function storyPage(story: Story, page: number): PageSpec {
  return {
    page,
    title: story.headline,
    root: () =>
      h(Document, {
        title: story.section,
        lines: [{ foreground: Colour.Yellow, text: story.headline }, { foreground: Colour.White, text: "" }, ...articleLines(story.blocks, TEXT_CELLS)],
        background: LOOKS.services.background,
        foreground: LOOKS.services.foreground,
        prompts: servicesPrompts(["Weather", PAGES.weather]),
        index: PAGES.index,
      }),
  };
}
