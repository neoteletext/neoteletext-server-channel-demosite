// Invaders: Left and Right move the cannon, Space or Up fires; the
// invaders march and drop bombs, and it is over when one reaches the
// ground or a bomb hits.

import { Colour, Key, type Sixels } from "neoteletext-server-ts-protocol";
import { isPress, type KeyEvent } from "neoteletext-server-ts-ui-components";
import { ArcadeGame, FIELD_ACROSS, type Play, SPACE_KEY } from "./arcade-game.ts";
import { drawSprite } from "./sprite.ts";

interface Point {
  readonly x: number;
  readonly y: number;
}

interface InvadersState extends Play {
  readonly cannon: number;
  readonly moving: number;
  /** The invaders left, by their place in the formation. */
  readonly alive: ReadonlySet<number>;
  /** The formation's top-left, and the way it marches. */
  readonly formation: Point;
  readonly marching: number;
  readonly shot: Point | null;
  readonly bombs: readonly Point[];
  /** Frames counted, for the march's pace. */
  readonly frame: number;
}

/** An invader, as sixels. */
const INVADER = ["#.#", "###", "#.#"] as const;
const INVADER_WIDTH = 3;
const INVADER_HEIGHT = 3;
const SPACING_ACROSS = 6;
const SPACING_DOWN = 5;
const ACROSS = 8;
const DOWN = 3;
const CANNON = [".#.", "###"] as const;
const CANNON_WIDTH = 3;
const CANNON_STEP = 2;
/** The formation marches a sixel every MARCH_FRAMES frames, and drops this far at an edge. */
const MARCH_FRAMES = 3;
const DROP = 2;
/** One frame in BOMB_CHANCE drops a bomb. */
const BOMB_CHANCE = 6;
const POINTS = 25;
/** Where the formation starts, a little in from the top-left. */
const FORMATION_START = { x: 2, y: 2 } as const;
const FRAME_MS = 80;

export class Invaders extends ArcadeGame<InvadersState> {
  protected readonly game = "Invaders";
  protected readonly frameMs = FRAME_MS;
  protected readonly colour = Colour.Green;
  override state: InvadersState = this.fresh();

  protected fresh(): InvadersState {
    return {
      score: 0,
      over: false,
      cannon: Math.floor(FIELD_ACROSS / 2),
      moving: 0,
      alive: new Set(Array.from({ length: ACROSS * DOWN }, (_, place) => place)),
      formation: FORMATION_START,
      marching: 1,
      shot: null,
      bombs: [],
      frame: 0,
    };
  }

  #invaderAt(formation: Point, place: number): Point {
    return { x: formation.x + (place % ACROSS) * SPACING_ACROSS, y: formation.y + Math.floor(place / ACROSS) * SPACING_DOWN };
  }

  #march(state: InvadersState): Pick<InvadersState, "formation" | "marching"> {
    if (state.frame % MARCH_FRAMES !== 0) {
      return state;
    }
    const places = [...state.alive].map((place) => this.#invaderAt(state.formation, place).x);
    const left = Math.min(...places) + state.marching;
    const right = Math.max(...places) + INVADER_WIDTH + state.marching;
    if (left < 0 || right > FIELD_ACROSS) {
      return { formation: { x: state.formation.x, y: state.formation.y + DROP }, marching: -state.marching };
    }
    return { formation: { x: state.formation.x + state.marching, y: state.formation.y }, marching: state.marching };
  }

  protected step(state: InvadersState): InvadersState {
    const ground = this.down - CANNON.length;
    const cannon = Math.min(FIELD_ACROSS - CANNON_WIDTH, Math.max(0, state.cannon + state.moving * CANNON_STEP));
    const { formation, marching } = this.#march(state);
    let alive = state.alive;
    let score = state.score;
    let shot = state.shot === null ? null : { x: state.shot.x, y: state.shot.y - 1 };
    if (shot !== null) {
      const hit = [...alive].find((place) => {
        const invader = this.#invaderAt(formation, place);
        return shot !== null && shot.x >= invader.x && shot.x < invader.x + INVADER_WIDTH && shot.y >= invader.y && shot.y < invader.y + INVADER_HEIGHT;
      });
      if (hit !== undefined) {
        alive = new Set([...alive].filter((place) => place !== hit));
        score += POINTS;
        shot = null;
      } else if (shot.y < 0) {
        shot = null;
      }
    }
    let bombs = state.bombs.map((bomb) => ({ x: bomb.x, y: bomb.y + 1 })).filter((bomb) => bomb.y < this.down);
    const dropper = [...alive][this.services.below(Math.max(1, alive.size))];
    if (dropper !== undefined && this.services.below(BOMB_CHANCE) === 0) {
      const invader = this.#invaderAt(formation, dropper);
      bombs = [...bombs, { x: invader.x + 1, y: invader.y + INVADER_HEIGHT }];
    }
    const bombed = bombs.some((bomb) => bomb.y >= ground && bomb.x >= cannon && bomb.x < cannon + CANNON_WIDTH);
    const landed = [...alive].some((place) => this.#invaderAt(formation, place).y + INVADER_HEIGHT >= ground);
    // A cleared formation comes again from the top.
    const next = alive.size === 0 ? { alive: this.fresh().alive, formation: this.fresh().formation } : { alive, formation };
    return { ...state, ...next, cannon, marching, shot, bombs, score, over: bombed || landed, frame: state.frame + 1 };
  }

  protected draw(sixels: Sixels, state: InvadersState): void {
    for (const place of state.alive) {
      const invader = this.#invaderAt(state.formation, place);
      drawSprite(sixels, INVADER, invader.x, invader.y);
    }
    const ground = this.down - CANNON.length;
    drawSprite(sixels, CANNON, state.cannon, ground);
    if (state.shot !== null) {
      sixels.set(state.shot.x, state.shot.y, true);
    }
    for (const bomb of state.bombs) {
      sixels.set(bomb.x, bomb.y, true);
    }
  }

  protected steer(event: KeyEvent, state: InvadersState): Partial<InvadersState> | null {
    if (isPress(event, SPACE_KEY) || isPress(event, Key.Up)) {
      return state.shot === null ? { shot: { x: state.cannon + 1, y: this.down - CANNON.length - 1 } } : {};
    }
    if (event.key !== Key.Left && event.key !== Key.Right) {
      return null;
    }
    if (!isPress(event, event.key)) {
      return { moving: 0 };
    }
    return { moving: event.key === Key.Left ? -1 : 1 };
  }
}
