// Games, magazine 3: the arcade and its hall of fame.

import type { Area } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { breakoutPage, cavePage, invadersPage } from "./game-pages.ts";
import { hallPage } from "./hall-page.ts";
import { luckyDipPage } from "./lucky-dip-page.ts";
import { snakePage } from "./snake-page.ts";

export const GAMES: Area = {
  name: "Games",
  about: "Snake, Breakout, Invaders, a cave",
  look: LOOKS.games,
  menu: PAGES.games,
  pages: (site) => [
    { spec: snakePage(), about: "The arrows turn; eat, and grow" },
    { spec: breakoutPage(site.hall), about: "Left and Right; break the wall" },
    { spec: invadersPage(site.hall), about: "Left and Right, Space fires" },
    { spec: cavePage(site.hall), about: "Hold Up to climb" },
    { spec: luckyDipPage(), about: "Spin for a story" },
    { spec: hallPage(site.hall), about: "The best scores, live" },
  ],
};
