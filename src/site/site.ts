// What the pages share, made once in main.ts: the pictures, and the
// records viewers add to (the poll, the guestbook, the hall of fame),
// which the site keeps rather than any one viewer's copy of a page, in the
// channel's store, so that they outlast the program (REQ-1057).

import { type StateStore, Tally } from "neoteletext-server-ts-ui-components";
import { Guestbook } from "../pages/interactive/guestbook.ts";
import { HallOfFame } from "../pages/games/hall-of-fame.ts";
import type { Picture } from "../pictures/picture.ts";

export interface Site {
  /** The converted pictures; none when no folder was given or it held none. */
  readonly pictures: readonly Picture[];
  readonly poll: Tally;
  readonly guestbook: Guestbook;
  readonly hall: HallOfFame;
}

const POLL_NAME = "teletext";
const POLL_OPTIONS = ["Ceefax", "Oracle", "Teletext Ltd", "4-Tel", "Something newer"] as const;

/** A site over `pictures`, with what was voted, signed and scored as `store` keeps it. */
export function makeSite(pictures: readonly Picture[], store: StateStore): Site {
  return { pictures, poll: new Tally(POLL_NAME, POLL_OPTIONS, store), guestbook: new Guestbook(store), hall: new HallOfFame(store) };
}
