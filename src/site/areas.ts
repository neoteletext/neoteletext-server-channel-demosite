// The areas, in the index's order.

import { ADVENTURE } from "../pages/adventure/area.ts";
import { AUDIO } from "../pages/audio/area.ts";
import { GALLERY } from "../pages/gallery/area.ts";
import { GAMES } from "../pages/games/area.ts";
import { INTERACTIVE } from "../pages/interactive/area.ts";
import { SERVICES } from "../pages/services/area.ts";
import type { Area } from "./area.ts";

export const AREAS: readonly Area[] = [SERVICES, INTERACTIVE, GAMES, ADVENTURE, AUDIO, GALLERY];
