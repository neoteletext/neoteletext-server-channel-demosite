// Adventure, magazine 4: text adventures with pictures in mosaic.

import type { Area } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { adventurePage } from "./adventure-pages.ts";
import { CROWN } from "./crown.ts";
import { STATION } from "./station.ts";

export const ADVENTURE: Area = {
  name: "Adventure",
  about: "Text adventures with pictures",
  look: LOOKS.adventure,
  menu: PAGES.adventure,
  pages: () => [
    { spec: adventurePage(PAGES.station, STATION, ["The Crown", PAGES.crown]), about: "An empty space station" },
    { spec: adventurePage(PAGES.crown, CROWN, ["The Station", PAGES.station]), about: "A castle and a lost crown" },
  ],
};
