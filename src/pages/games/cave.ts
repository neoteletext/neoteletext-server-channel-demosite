// Cave flyer: hold Up to climb, let go to fall, and fly as far as you can
// through a cave that narrows as it goes.

import { Colour, Key, type Sixels } from "neoteletext-server-ts-protocol";
import { isPress, type KeyEvent } from "neoteletext-server-ts-ui-components";
import { ArcadeGame, FIELD_ACROSS, type Play, SPACE_KEY } from "./arcade-game.ts";

interface CaveState extends Play {
  /** The ship's height from the top, in sixels. */
  readonly ship: number;
  readonly climbing: boolean;
  /** Each column's roof and floor, from the left of the field. */
  readonly roof: readonly number[];
  readonly floor: readonly number[];
}

/** The ship's column, and its length. */
const SHIP_X = 10;
const SHIP_LENGTH = 3;
/** The cave's narrowest gap, and how far its walls wander a column. */
const NARROWEST = 9;
const WANDER = 3;
/** The roof's highest wander from the top, a third of the field: the floor's is the same from the bottom. */
const WALL_SHARE = 3;
const FRAME_MS = 90;
/** The floor starts this far up from the bottom, the roof a sixel down from the top. */
const FLOOR_START = 2;

export class Cave extends ArcadeGame<CaveState> {
  protected readonly game = "Cave flyer";
  protected readonly frameMs = FRAME_MS;
  protected readonly colour = Colour.Yellow;
  override state: CaveState = this.fresh();

  protected fresh(): CaveState {
    return {
      score: 0,
      over: false,
      ship: Math.floor(this.down / 2),
      climbing: false,
      roof: Array.from({ length: FIELD_ACROSS }, () => 1),
      floor: Array.from({ length: FIELD_ACROSS }, () => this.down - FLOOR_START),
    };
  }

  /** The next column's wall, `last` wandered by up to WANDER either way, between `least` and `most`. */
  #wander(last: number, least: number, most: number): number {
    return Math.min(most, Math.max(least, last + this.services.below(WANDER) - 1));
  }

  protected step(state: CaveState): CaveState {
    const lastRoof = state.roof.at(-1) ?? 0;
    const lastFloor = state.floor.at(-1) ?? this.down;
    const roof = this.#wander(lastRoof, 0, Math.floor(this.down / WALL_SHARE));
    const floor = Math.max(roof + NARROWEST, this.#wander(lastFloor, this.down - Math.floor(this.down / WALL_SHARE), this.down - 1));
    const ship = state.ship + (state.climbing ? -1 : 1);
    const nextRoof = [...state.roof.slice(1), roof];
    const nextFloor = [...state.floor.slice(1), floor];
    const crashed = Array.from({ length: SHIP_LENGTH }, (_, along) => SHIP_X + along).some(
      (x) => ship <= (nextRoof[x] ?? 0) || ship >= (nextFloor[x] ?? this.down),
    );
    return { ...state, ship, roof: nextRoof, floor: nextFloor, score: state.score + 1, over: crashed };
  }

  protected draw(sixels: Sixels, state: CaveState): void {
    for (let x = 0; x < FIELD_ACROSS; x += 1) {
      for (let y = 0; y <= (state.roof[x] ?? 0); y += 1) {
        sixels.set(x, y, true);
      }
      for (let y = state.floor[x] ?? this.down; y < this.down; y += 1) {
        sixels.set(x, y, true);
      }
    }
    for (let along = 0; along < SHIP_LENGTH; along += 1) {
      sixels.set(SHIP_X + along, state.ship, true);
    }
  }

  protected steer(event: KeyEvent): Partial<CaveState> | null {
    if (event.key !== Key.Up && event.key !== SPACE_KEY) {
      return null;
    }
    return { climbing: isPress(event, event.key) };
  }
}
