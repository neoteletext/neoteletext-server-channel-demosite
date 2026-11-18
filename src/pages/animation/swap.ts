// A double-buffered page swap (animation.md ANIM-3): two whole pages, each
// with its own rows and its own sprite. Space has the channel send the
// other one inside a frame, which the browser holds until it has all of it
// and then shows on one tick; U sends the same with no frame.

import { characterKey, Colour, type Context, type Input, mosaicColour } from "neoteletext-server-ts-protocol";
import type { PageRule, Sprite } from "neoteletext-server-ts-protocol/protocol";

import { PAGES } from "../../site/page-numbers.ts";
import { type AnimationPage, sprite } from "./animation-page.ts";
import { FIRST_BODY_ROW, LAST_BODY_ROW, sheet } from "./sheet.ts";
import { enhanced, lettered } from "./triplets.ts";

const BADGE = 1;
const BADGE_SIZE = [1, 8] as const;
const COLUMNS = 40;
/** A mosaic with all six of its cells set (EN 300 706 clause 15.7.1). */
const FULL = 0x7f;
/** The one sub-page the page has. */
const SUB = 0;
const FRAMED = "framed";
const UNFRAMED = "unframed";

/** One of the two pages: its colour, its name, and where its badge, a sprite, lies. */
interface Side {
  readonly colour: Colour;
  readonly name: string;
  readonly badge: readonly [row: number, column: number];
}

const SIDES: readonly [Side, Side] = [
  { colour: Colour.Red, name: "PAGE ONE", badge: [FIRST_BODY_ROW + 2, 4] },
  { colour: Colour.Green, name: "PAGE TWO", badge: [LAST_BODY_ROW - 2, 28] },
];

function drawn(side: Side): { readonly content: AnimationPage["content"]; readonly sprites: Sprite[] } {
  const screen = sheet(PAGES.swap, {
    title: "A page swapped whole",
    watch: ["Space swaps the two pages in a frame;", "U swaps them with no frame."],
    how: [
      "Space is sent to the channel, which",
      "sends the other page, rows and sprite,",
      "in a frame. The browser holds a frame",
      "and shows all of it on one tick.",
    ],
  });
  // Every row of the body filled, so that a page half arrived would be seen.
  for (let row = FIRST_BODY_ROW; row <= LAST_BODY_ROW; row += 1) {
    screen.codes(row, 0, [mosaicColour(side.colour), ...Array.from({ length: COLUMNS - 1 }, () => FULL)]);
  }
  const { enhancements, frames } = enhanced([], [[lettered(Colour.White, Colour.Blue, side.name)]]);
  return { content: { ...screen.content(), enhancements }, sprites: [sprite(BADGE, side.badge, BADGE_SIZE, frames)] };
}

const DRAWN = [drawn(SIDES[0]), drawn(SIDES[1])] as const;

function sendRule(name: string, key: string): PageRule {
  return { name, on: { event: "key", keys: [characterKey(key)] }, do: [{ type: "report" }] };
}

class Swap implements AnimationPage {
  readonly page = PAGES.swap;
  readonly title = "Page swap";
  readonly about = "A whole page swapped in on one tick";
  readonly table = { rules: [sendRule(FRAMED, " "), sendRule(UNFRAMED, "u")] };
  readonly content = DRAWN[0].content;
  readonly sprites = DRAWN[0].sprites;
  /** The connections on the page, and whether each is shown the second page. */
  readonly #second = new Map<number, boolean>();

  arrived(connection: number, context: Context): void {
    // The viewer's own copy of the page from the start, so that a swap changes that copy alone and the other viewers keep the page they have.
    this.#second.set(connection, false);
    context.put(connection, PAGES.swap, [{ content: DRAWN[0].content, subcode: SUB }]);
  }

  input(connection: number, input: Input, context: Context): boolean {
    const shown = this.#second.get(connection);
    if (shown === undefined || (input.rule !== FRAMED && input.rule !== UNFRAMED)) {
      return false;
    }
    this.#second.set(connection, !shown);
    const { content, sprites } = DRAWN[shown ? 0 : 1];
    const to = { connection };
    const send = (): void => {
      context.put(connection, PAGES.swap, [{ content, subcode: SUB }]);
      context.sprites(to, PAGES.swap, SUB, sprites);
    };
    if (input.rule === FRAMED) {
      context.frame(to, PAGES.swap, SUB, send);
    } else {
      send();
    }
    return true;
  }

  left(connection: number, context: Context | null): void {
    // A viewer who comes back starts from the first page.
    if (this.#second.delete(connection)) {
      context?.release(connection, PAGES.swap);
    }
  }
}

export function swapPage(): AnimationPage {
  return new Swap();
}
