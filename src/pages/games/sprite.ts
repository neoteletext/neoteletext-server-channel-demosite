// A sprite drawn on a field: lines of # for a sixel set, . for clear.

import type { Sixels } from "neoteletext-server-ts-protocol";

/** The sixel a sprite's line sets. */
const SET = "#";

/** Draws `sprite` with its top-left at `x`, `y`. */
export function drawSprite(sixels: Sixels, sprite: readonly string[], x: number, y: number): void {
  sprite.forEach((line, down) => {
    for (let across = 0; across < line.length; across += 1) {
      sixels.set(x + across, y + down, line.charAt(across) === SET);
    }
  });
}
