// Controls hidden and shown by rules (animation.md ANIM-6; page-rules.md
// RULE-12, RULE-20): three controls, which the page's packet X/26/0
// declares with NeoTeletext's control triplet. Rules hide and show the
// second and force its looks from keys, and hide the third while the
// pointer is pressed on the first, all in the viewer's browser.

import { characterKey, Colour } from "neoteletext-server-ts-protocol";
import type { LookName, PageRule, RuleAction } from "neoteletext-server-ts-protocol/protocol";

import { PAGES } from "../../site/page-numbers.ts";
import type { AnimationPage } from "./animation-page.ts";
import { FIRST_BODY_ROW, put, sheet } from "./sheet.ts";
import { control, enhanced } from "./triplets.ts";

/** The controls, numbered from 1 in the order the page declares them (RULE-12). */
const ALPHA = 1;
const BRAVO = 2;
const CHARLIE = 3;
const CONTROL_COLUMN = 3;
const CONTROL_WIDTH = 12;
const NOTE_COLUMN = 17;
/** Each control's row, its name, and what the page says beside it. */
const CONTROLS: readonly (readonly [row: number, name: string, note: string])[] = [
  [FIRST_BODY_ROW + 1, "ALPHA", "hold: hides Charlie"],
  [FIRST_BODY_ROW + 4, "BRAVO", "H hides it, S shows"],
  [FIRST_BODY_ROW + 7, "CHARLIE", "hidden while Alpha"],
];

const { enhancements } = enhanced(
  CONTROLS.flatMap(([row]) => control(row, CONTROL_COLUMN, CONTROL_WIDTH)),
  [],
);

function keyRule(name: string, key: string, action: RuleAction): PageRule {
  return { name, on: { event: "key", keys: [characterKey(key)] }, do: [action] };
}

function lookRule(key: string, look: LookName): PageRule {
  return keyRule(`look_${look}`, key, { action: "look", target: { control: BRAVO }, look });
}

function drawn(): AnimationPage["content"] {
  const screen = sheet(PAGES.controls, {
    title: "Controls shown and hidden",
    watch: ["H hides Bravo, S shows it; 1 2 3 force", "its looks. Hold the pointer on Alpha."],
    how: [
      "Each button is a control the page",
      "declares. Rules hide, show and force",
      "the looks of a control by its number,",
      "in the browser. Nothing is sent.",
    ],
  });
  for (const [row, name, note] of CONTROLS) {
    // The colour's cell is the control's first: the name fills the rest of its width.
    put(screen, row, CONTROL_COLUMN, Colour.Yellow, ` ${name}`.padEnd(CONTROL_WIDTH - 1));
    put(screen, row, NOTE_COLUMN, Colour.White, note);
  }
  put(screen, FIRST_BODY_ROW + 9, CONTROL_COLUMN, Colour.Green, "1 normal  2 hover  3 pressed");
  return { ...screen.content(), enhancements };
}

export const CONTROLS_PAGE: AnimationPage = {
  page: PAGES.controls,
  title: "Controls",
  about: "Buttons hidden and shown by rules",
  table: {
    rules: [
      keyRule("hide", "h", { action: "hide", target: { control: BRAVO } }),
      keyRule("show", "s", { action: "show", target: { control: BRAVO } }),
      lookRule("1", "normal"),
      lookRule("2", "hover"),
      lookRule("3", "pressed"),
      // Button 0: the main button, a touch or a pen. The release fires wherever the pointer then is (RULE-9).
      { name: "alpha_down", on: { event: "press", target: { control: ALPHA }, button: 0 }, do: [{ action: "hide", target: { control: CHARLIE } }] },
      { name: "alpha_up", on: { event: "release", target: { control: ALPHA }, button: 0 }, do: [{ action: "show", target: { control: CHARLIE } }] },
    ],
  },
  content: drawn(),
  sprites: [],
};
