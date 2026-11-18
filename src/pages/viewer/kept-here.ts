// What this channel keeps for a viewer, and why (viewer-state.md VS-409,
// VS-702): only what the viewer asked for here, for as long as the store's
// limits say, never for advertising, profiling or anyone else. Text in a
// scrolling view.

import { Colour, COLUMNS } from "neoteletext-server-ts-protocol";
import { BAR_CELLS, BODY_ROWS, type Child, Component, type Element, h, ScrollView, Text } from "neoteletext-server-ts-ui-components";
import { linesOf } from "../languages/language-page.ts";
import { REMEMBERED_KEPT, VISIT_KEPT } from "./viewer-words.ts";

/** A line's cells: the row less the view's bar and the cell of the line's colour. */
const LINE_CELLS = COLUMNS - BAR_CELLS - 1;

/** Each thing said, and what it says. */
const KEPT: readonly (readonly [what: string, said: string])[] = [
  [
    "A handle",
    "The server gives the channel a handle for your browser on this channel alone. It is personal data: it lets the channel know your tabs and visits are yours.",
  ],
  ["What is kept", "Only what you asked for here: your poll vote, so you vote once; your visit count; the language you chose."],
  ["For how long", `For a visit, ${VISIT_KEPT} after its last use; remembered, ${REMEMBERED_KEPT}.`],
  ["Never", "Nothing is kept for advertising, for profiling you, or for anyone else. Counts are only ever of everyone together."],
  ["Forget", "Forget me deletes it all at once, and your browser can forget this channel at any time."],
  ["Your rights", "You may ask what is kept for you, and have it deleted."],
];

export class KeptHere extends Component {
  #units(): Element[] {
    const units: Element[] = [];
    for (const [place, [what, said]] of KEPT.entries()) {
      units.push(h(Text, { key: `what ${place}`, text: what, foreground: Colour.Yellow }));
      for (const [at, line] of linesOf(said, LINE_CELLS).entries()) {
        units.push(h(Text, { key: `said ${place} ${at}`, text: line }));
      }
      units.push(h(Text, { key: `gap ${place}`, text: "" }));
    }
    return units;
  }

  override render(): Child {
    return h(ScrollView, { shown: BODY_ROWS, autoFocus: true }, ...this.#units());
  }
}
