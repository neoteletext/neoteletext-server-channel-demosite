// Frame cycling with characters and mosaics (animation.md ANIM-14): two
// sprites whose frames are teletext objects, one of characters and one of
// mosaics, which the browser steps through on its clock. A teletext frame
// is never a DRCS character (the engine's REQ-2196).

import { characterKey, Colour } from "neoteletext-server-ts-protocol";
import type { AnimationOp, PageRule } from "neoteletext-server-ts-protocol/protocol";

import { PAGES } from "../../site/page-numbers.ts";
import { animate, type AnimationPage, sprite } from "./animation-page.ts";
import { FIRST_BODY_ROW, put, sheet } from "./sheet.ts";
import { enhanced, lettered, mosaics } from "./triplets.ts";

const ARROW = 1;
const BAR = 2;
/** The arrow's frames: it runs across five cells. */
const ARROW_CELLS = 5;
/** The bar's frames: none to four cells of it filled, on two rows. */
const BAR_CELLS = 4;
const BAR_FRAMES = BAR_CELLS + 1;
/** A mosaic with all six of its cells set, and one with none (EN 300 706 clause 15.7.1). */
const FULL = 0x7f;
const EMPTY = 0x20;
/** Ticks of a sixtieth of a second each frame is shown. */
const ARROW_TICKS = 8;
const BAR_TICKS = 12;
const ARROW_ROW = FIRST_BODY_ROW + 2;
const BAR_ROW = ARROW_ROW + 4;
const LABEL_COLUMN = 1;
const SPRITE_COLUMN = 24;

const arrowObjects = Array.from({ length: ARROW_CELLS }, (_unused, at) => [
  lettered(Colour.Yellow, Colour.Blue, `${" ".repeat(at)}>${" ".repeat(ARROW_CELLS - 1 - at)}`),
]);
const barObjects = Array.from({ length: BAR_FRAMES }, (_unused, filled) => {
  const row = mosaics(
    Colour.Green,
    Colour.Black,
    Array.from({ length: BAR_CELLS }, (_cell, at) => (at < filled ? FULL : EMPTY)),
  );
  return [row, row];
});
const { enhancements, frames } = enhanced([], [...arrowObjects, ...barObjects]);

const RUNNING: readonly AnimationOp[] = [
  { action: "cycle", target: { object: ARROW }, first: 0, last: ARROW_CELLS - 1, period: ARROW_TICKS, once: false },
  { action: "cycle", target: { object: BAR }, first: 0, last: BAR_FRAMES - 1, period: BAR_TICKS, once: false },
];

function keyRule(name: string, key: string, ops: readonly AnimationOp[]): PageRule {
  return { name, on: { event: "key", keys: [characterKey(key)] }, do: [animate(...ops)] };
}

function drawn(): AnimationPage["content"] {
  const screen = sheet(PAGES.cycling, {
    title: "Frame cycling",
    watch: ["Watch the arrow run and the bar fill.", "S stops them, G starts them."],
    how: [
      "Each sprite lists several objects as",
      "its frames. The rule of the page's",
      "opening animates them with cycle: the",
      "browser shows each frame in its turn.",
    ],
  });
  put(screen, ARROW_ROW, LABEL_COLUMN, Colour.White, "Frames of characters:");
  put(screen, BAR_ROW, LABEL_COLUMN, Colour.White, "Frames of mosaics:");
  return { ...screen.content(), enhancements };
}

export const CYCLING_PAGE: AnimationPage = {
  page: PAGES.cycling,
  title: "Frame cycling",
  about: "Frames of characters and of mosaics",
  table: {
    rules: [
      { name: "run", on: { event: "open" }, do: [animate(...RUNNING)] },
      keyRule("stop", "s", [
        { action: "stop_cycle", target: { object: ARROW } },
        { action: "stop_cycle", target: { object: BAR } },
      ]),
      keyRule("go", "g", RUNNING),
    ],
  },
  content: drawn(),
  sprites: [
    sprite(ARROW, [ARROW_ROW, SPRITE_COLUMN], [1, ARROW_CELLS], frames.slice(0, ARROW_CELLS)),
    sprite(BAR, [BAR_ROW, SPRITE_COLUMN], [2, BAR_CELLS], frames.slice(ARROW_CELLS)),
  ],
};
