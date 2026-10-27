// The page of one of the arcade's own games: its field over the body's rows.

import { h, type PageSpec } from "neottx-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { SOUNDS } from "../../parts/sounds.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import type { ArcadeGame, ArcadeProps, Play } from "./arcade-game.ts";
import { FIELD_ROWS } from "./field.ts";
import type { HallOfFame } from "./hall-of-fame.ts";
import { gamesPrompts } from "./prompts.ts";

/** A page of one of the arcade's own games. */
export function arcadePage(
  page: number,
  title: string,
  game: new (props: ArcadeProps) => ArcadeGame<Play>,
  hall: HallOfFame,
  next: readonly [label: string, page: number],
): PageSpec {
  return {
    page,
    title,
    root: () =>
      frame({ look: LOOKS.games, title, prompts: gamesPrompts(next, ["Hall of fame", PAGES.hall]) }, h(game, { rows: FIELD_ROWS, hall, crash: SOUNDS.crash })),
  };
}
