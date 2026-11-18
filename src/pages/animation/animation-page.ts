// An animation page of the demo site (animation.md section 11: a page
// showing each mechanism a teletext page has): a page the channel writes
// itself with the protocol kit, beside the component library's, with its
// own rule table, so that it sends the channel only what its rules send.

import type { Context, Input, SubPageContent } from "neoteletext-server-ts-protocol";
import type { AnimationOp, RuleCommand, RuleTable, Sprite, SpriteFrame } from "neoteletext-server-ts-protocol/protocol";

export interface AnimationPage {
  readonly page: number;
  readonly title: string;
  /** A few words for the menu. */
  readonly about: string;
  /** The page's rule table: the only input the page asks for. */
  readonly table: RuleTable;
  /** The page everyone is sent: its rows and its packets X/26. */
  readonly content: SubPageContent;
  /** Its sprites, each a placement of objects its packets X/26 define (ANIM-7). */
  readonly sprites: readonly Sprite[];
  /** A connection came to the page, before it is sent the page's sprites and table. */
  arrived?(connection: number, context: Context): void;
  /** An input a rule of the page's table sent. */
  input?(connection: number, input: Input, context: Context): boolean;
  /** The connection left the page, or is gone: forget it. */
  left?(connection: number, context: Context | null): void;
}

/** The sprites' layer (ANIM-12): layer 0 is the page itself. */
const SPRITE_LAYER = 2;

/** A shown sprite of the sprites' layer, `width` cells by `height`, with its origin at `row`, `column`. */
export function sprite(
  number: number,
  [row, column]: readonly [number, number],
  [height, width]: readonly [number, number],
  frames: readonly SpriteFrame[],
): Sprite {
  return { number, shown: true, detectable: false, layer: SPRITE_LAYER, order: 0, column, row, width, height, frames };
}

/** A group's `animate` command of the operations `ops` (page-rules.md RULE-119; animation.md ANIM-6): what every rule of these pages but the swap's runs. */
export function animate(...ops: readonly AnimationOp[]): RuleCommand {
  return { type: "animate", ops };
}
