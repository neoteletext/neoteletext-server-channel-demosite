// Flash on the presentation clock (animation.md ANIM-1): a word with the
// Flash attribute of Level 1 beside three counters, sprites whose frames
// are digits, which the browser cycles on the same clock of sixty ticks a
// second. The flash is 57 ticks shown and 19 hidden; the first counter
// turns every 19 ticks, so the word is dark for one digit in four.

import { Attribute, Colour } from "neoteletext-server-ts-protocol";
import type { AnimationOp } from "neoteletext-server-ts-protocol/protocol";

import { PAGES } from "../../site/page-numbers.ts";
import { animate, type AnimationPage, sprite } from "./animation-page.ts";
import { FIRST_BODY_ROW, put, sheet } from "./sheet.ts";
import { enhanced, lettered } from "./triplets.ts";

const QUARTERS = 1;
const TENTHS = 2;
const SECONDS = 3;
const DIGITS = 10;
/** The Level 1 flash's hidden part, and a quarter of its whole period of 76 ticks (ANIM-1: `FLASH_HIDDEN_TICKS`). */
const QUARTER_TICKS = 19;
const QUARTER_FRAMES = 4;
/** A tenth of a second, and a second, in ticks. */
const TENTH_TICKS = 6;
const SECOND_TICKS = 60;
const LABEL_COLUMN = 1;
const COUNTER_COLUMN = 30;
/** A counter is a digit with a space on each side. */
const COUNTER_SIZE = [1, 3] as const;
const FLASH_ROW = FIRST_BODY_ROW + 1;
const QUARTERS_ROW = FLASH_ROW + 2;
const TENTHS_ROW = QUARTERS_ROW + 2;
const SECONDS_ROW = TENTHS_ROW + 2;

/** The digits as objects: each a digit in yellow on blue. */
const { enhancements, frames: digitFrames } = enhanced(
  [],
  Array.from({ length: DIGITS }, (_unused, digit) => [lettered(Colour.Yellow, Colour.Blue, ` ${digit} `)]),
);

function cycling(number: number, last: number, period: number): AnimationOp {
  return { action: "cycle", target: { object: number }, first: 0, last, period, once: false };
}

function drawn(): AnimationPage["content"] {
  const screen = sheet(PAGES.flash, {
    title: "Flash and the tick clock",
    watch: ["Watch the word flash beside the", "counters. No keys."],
    how: [
      "The word has the Flash attribute: 57",
      "ticks shown, 19 hidden, of a sixtieth",
      "of a second. The counters are sprites",
      "the browser cycles on the same clock.",
    ],
  });
  put(screen, FLASH_ROW, LABEL_COLUMN, Colour.Red, "FLASHING", [Attribute.Flash]);
  put(screen, FLASH_ROW, LABEL_COLUMN + 12, Colour.White, "57 ticks on, 19 off");
  put(screen, QUARTERS_ROW, LABEL_COLUMN, Colour.White, "A digit every 19 ticks:");
  put(screen, TENTHS_ROW, LABEL_COLUMN, Colour.White, "Tenths of a second:");
  put(screen, SECONDS_ROW, LABEL_COLUMN, Colour.White, "Seconds:");
  put(screen, SECONDS_ROW + 2, LABEL_COLUMN, Colour.Green, "The word is dark for one digit in 4.");
  return { ...screen.content(), enhancements };
}

export const FLASH_PAGE: AnimationPage = {
  page: PAGES.flash,
  title: "Flash and ticks",
  about: "Flash, timed on the browser's clock",
  table: {
    rules: [
      {
        name: "count",
        on: { event: "open" },
        do: [
          animate(cycling(QUARTERS, QUARTER_FRAMES - 1, QUARTER_TICKS), cycling(TENTHS, DIGITS - 1, TENTH_TICKS), cycling(SECONDS, DIGITS - 1, SECOND_TICKS)),
        ],
      },
    ],
  },
  content: drawn(),
  sprites: [
    // The quarters count 1 to 4: the digits' objects from the second.
    sprite(QUARTERS, [QUARTERS_ROW, COUNTER_COLUMN], COUNTER_SIZE, digitFrames.slice(1, 1 + QUARTER_FRAMES)),
    sprite(TENTHS, [TENTHS_ROW, COUNTER_COLUMN], COUNTER_SIZE, digitFrames),
    sprite(SECONDS, [SECONDS_ROW, COUNTER_COLUMN], COUNTER_SIZE, digitFrames),
  ],
};
