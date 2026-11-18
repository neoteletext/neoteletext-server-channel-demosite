// Teletext sprites (animation.md ANIM-7, ANIM-8): a rocket of two rows of
// characters, a teletext object the page's own packets X/26 define, which
// the arrow keys move a cell at a time by rules. The server does not yet
// send object pages (TODO-6569), so the object is a local one.

import { Colour, namedKey } from "neoteletext-server-ts-protocol";
import type { KeyName, PageRule } from "neoteletext-server-ts-protocol/protocol";

import { PAGES } from "../../site/page-numbers.ts";
import { animate, type AnimationPage, sprite } from "./animation-page.ts";
import { FIRST_BODY_ROW, LAST_BODY_ROW, put, sheet } from "./sheet.ts";
import { enhanced, lettered } from "./triplets.ts";

const ROCKET = 10;
const ROCKET_SIZE = [2, 4] as const;
/** Where the rocket starts, and Home returns it: row, then column. */
const HOME = [10, 18] as const;
/** The words the rocket passes over, on every other row of the page's body. */
const WORDS = "the page beneath is never sent again";

const { enhancements, frames } = enhanced([], [[lettered(Colour.Yellow, Colour.Red, "<**>"), lettered(Colour.White, Colour.Red, " II ")]]);

function moveRule(name: string, key: KeyName, x: number, y: number): PageRule {
  return {
    name,
    on: { event: "key", keys: [namedKey(key)], repeat: true },
    do: [animate({ action: "move", target: { object: ROCKET }, x, y, relative: true })],
  };
}

function drawn(): AnimationPage["content"] {
  const screen = sheet(PAGES.sprites, {
    title: "Sprites",
    watch: ["Arrow keys move the rocket a cell at a", "time. Home puts it back."],
    how: [
      "The rocket is a teletext object placed",
      "as a sprite. A rule for each arrow key",
      "moves it in the browser, which draws",
      "it over the page. No key is sent.",
    ],
  });
  for (let row = FIRST_BODY_ROW; row <= LAST_BODY_ROW; row += 2) {
    put(screen, row, 1, Colour.Blue, WORDS);
  }
  return { ...screen.content(), enhancements };
}

export const SPRITES_PAGE: AnimationPage = {
  page: PAGES.sprites,
  title: "Sprites",
  about: "A rocket the arrow keys move",
  table: {
    rules: [
      // A sprite's position is in cells: x the column, y the row.
      moveRule("left", "ArrowLeft", -1, 0),
      moveRule("right", "ArrowRight", 1, 0),
      moveRule("up", "ArrowUp", 0, -1),
      moveRule("down", "ArrowDown", 0, 1),
      {
        name: "home",
        on: { event: "key", keys: [namedKey("Home")] },
        do: [animate({ action: "move", target: { object: ROCKET }, x: HOME[1], y: HOME[0], relative: false })],
      },
    ],
  },
  content: drawn(),
  sprites: [sprite(ROCKET, HOME, ROCKET_SIZE, frames)],
};
