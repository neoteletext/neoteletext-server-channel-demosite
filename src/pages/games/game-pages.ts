// The pages of the arcade's own games: Breakout, Invaders and the cave flyer.

import type { PageSpec } from "neottx-server-ts-ui-components";
import { PAGES } from "../../site/page-numbers.ts";
import { arcadePage } from "./arcade-page.ts";
import { Breakout } from "./breakout.ts";
import { Cave } from "./cave.ts";
import type { HallOfFame } from "./hall-of-fame.ts";
import { Invaders } from "./invaders.ts";

export function breakoutPage(hall: HallOfFame): PageSpec {
  return arcadePage(PAGES.breakout, "Breakout", Breakout, hall, ["Invaders", PAGES.invaders]);
}

export function invadersPage(hall: HallOfFame): PageSpec {
  return arcadePage(PAGES.invaders, "Invaders", Invaders, hall, ["Cave flyer", PAGES.cave]);
}

export function cavePage(hall: HallOfFame): PageSpec {
  return arcadePage(PAGES.cave, "Cave flyer", Cave, hall, ["Snake", PAGES.snake]);
}
