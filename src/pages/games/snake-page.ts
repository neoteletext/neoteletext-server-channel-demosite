// Page 301, Snake: the library's own game.

import { h, type PageSpec, Snake } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { SOUNDS } from "../../parts/sounds.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { FIELD_ROWS } from "./field.ts";
import { gamesPrompts } from "./prompts.ts";

/** A frame's milliseconds: as fast as the server is happy to send a viewer pages. */
const SNAKE_MS = 150;

export function snakePage(): PageSpec {
  return {
    page: PAGES.snake,
    title: "Snake",
    root: () =>
      frame(
        { look: LOOKS.games, title: "Snake", prompts: gamesPrompts(["Breakout", PAGES.breakout], ["Hall of fame", PAGES.hall]) },
        h(Snake, { everyMs: SNAKE_MS, rows: FIELD_ROWS, eat: SOUNDS.eat, crash: SOUNDS.crash }),
      ),
  };
}
