// A text adventure's world: its rooms, their pictures in mosaic, the ways
// out of each, the things lying in them, and what wins it.

import type { Bitmap } from "neottx-server-ts-ui-components";

export const DIRECTIONS = ["north", "south", "east", "west", "up", "down"] as const;
export type Direction = (typeof DIRECTIONS)[number];

export interface Room {
  readonly name: string;
  readonly description: string;
  /** The room's picture: # for a sixel set. */
  readonly art: Bitmap;
  readonly exits: Partial<Readonly<Record<Direction, string>>>;
  /** Things lying here at the start. */
  readonly things?: readonly string[];
  /** A way out that needs a thing carried: its direction, the thing, and what is said without it. */
  readonly locked?: { readonly direction: Direction; readonly needs: string; readonly refusal: string };
}

export interface World {
  readonly title: string;
  readonly start: string;
  readonly rooms: Readonly<Record<string, Room>>;
  /** It is won by carrying `thing` into `room`. */
  readonly goal: { readonly room: string; readonly thing: string; readonly won: string };
}
