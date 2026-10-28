// Page 107, a long read: the story of teletext, over several sub-pages,
// which the browser turns as a magazine's pages.

import { COLUMNS } from "neoteletext-server-ts-protocol";
import { articleLines, type Block, Document, h, type PageSpec } from "neoteletext-server-ts-ui-components";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { servicesPrompts } from "./prompts.ts";

const ESSAY: readonly Block[] = [
  { kind: "heading", text: "A thousand characters at a time" },
  {
    kind: "paragraph",
    text: "Teletext began in the early 1970s as a way to put subtitles on television. Engineers found spare lines in the picture, the ones hidden above the top of the screen, and sent text in them.",
  },
  {
    kind: "paragraph",
    text: "A page was forty columns by twenty-five rows. Each cell held a letter or a block of six little squares, the sixels, and a page could change its colour from cell to cell, but only at the cost of a cell.",
  },
  { kind: "heading", text: "The magazine" },
  {
    kind: "paragraph",
    text: "Pages went out one after another in a loop, the magazine. A set waited for the page it was asked for to come round, which is why a page took a few seconds to arrive.",
  },
  {
    kind: "paragraph",
    text: "To hide the wait, services put their most read pages into the loop more often, and the Fastext links at the bottom told the set which pages to catch in advance.",
  },
  { kind: "heading", text: "What people read" },
  { kind: "item", text: "The news, written to fit: a headline and four short paragraphs." },
  { kind: "item", text: "The weather, the travel and the football results." },
  { kind: "item", text: "The TV guide, and subtitles on page 888." },
  { kind: "item", text: "Games, quizzes, and pages you were not supposed to find." },
  { kind: "heading", text: "Levels" },
  {
    kind: "paragraph",
    text: "Later levels added more: Level 1.5 more characters, Level 2.5 more colours and smoother graphics, Level 3.5 fonts of its own. The gallery, from 600, shows pictures at all three.",
  },
  { kind: "quote", text: '"It was the internet before the internet," as everyone who used it says.' },
  { kind: "heading", text: "Now" },
  {
    kind: "paragraph",
    text: "The broadcasts have gone, but the page has not. This service sends its pages over the network instead, and they answer back: everything on this channel is drawn by a library of components, much as a web page is.",
  },
];
/** A cell short of the page, for each line's colour. */
const TEXT_CELLS = COLUMNS - 1;

export function longReadPage(): PageSpec {
  return {
    page: PAGES.longRead,
    title: "Long read",
    root: () =>
      h(Document, {
        title: "Long read",
        lines: articleLines(ESSAY, TEXT_CELLS),
        background: LOOKS.services.background,
        foreground: LOOKS.services.foreground,
        prompts: servicesPrompts(["News", PAGES.news], ["About", PAGES.about]),
        index: PAGES.index,
      }),
  };
}
