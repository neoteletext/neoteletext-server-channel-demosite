// Breakout: Left and Right move the bat, the ball breaks the bricks, and
// three balls are lost before it is over.

import { Colour, Key, type Sixels } from "neottx-server-ts-protocol";
import { isPress, type KeyEvent } from "neottx-server-ts-ui-components";
import { ArcadeGame, FIELD_ACROSS, type Play } from "./arcade-game.ts";

interface Point {
  readonly x: number;
  readonly y: number;
}

interface BreakoutState extends Play {
  readonly bat: number;
  /** -1, 0 or 1: the way the bat moves while an arrow is held. */
  readonly moving: number;
  readonly ball: Point;
  readonly heading: Point;
  /** The bricks left, by their place: row * BRICKS_ACROSS + column. */
  readonly bricks: ReadonlySet<number>;
  readonly balls: number;
}

const BRICK_WIDTH = 4;
const BRICK_HEIGHT = 2;
/** A sixel between bricks. */
const BRICK_GAP = 1;
const BRICKS_ACROSS = Math.floor(FIELD_ACROSS / (BRICK_WIDTH + BRICK_GAP));
const BRICK_ROWS = 4;
/** The bricks start a gap down from the top. */
const BRICKS_TOP = 3;
const BAT_WIDTH = 12;
/** Sixels the bat moves a frame. */
const BAT_STEP = 3;
const BALLS = 3;
const POINTS_A_BRICK = 10;
const FRAME_MS = 80;
/** The ball is served from just over the bat. */
const SERVE_HEIGHT = 3;
/** The balls left are shown along the top right, a sixel apart. */
const SPARE_BALL_CELLS = 2;

export class Breakout extends ArcadeGame<BreakoutState> {
  protected readonly game = "Breakout";
  protected readonly frameMs = FRAME_MS;
  protected readonly colour = Colour.Cyan;
  override state: BreakoutState = this.fresh();

  protected fresh(): BreakoutState {
    const bricks = new Set(Array.from({ length: BRICKS_ACROSS * BRICK_ROWS }, (_, place) => place));
    return { score: 0, over: false, bricks, balls: BALLS, moving: 0, ...this.#serve() };
  }

  #serve(): Pick<BreakoutState, "bat" | "ball" | "heading"> {
    const bat = Math.floor((FIELD_ACROSS - BAT_WIDTH) / 2);
    return { bat, ball: { x: bat + BAT_WIDTH / 2, y: this.down - SERVE_HEIGHT }, heading: { x: 1, y: -1 } };
  }

  /** The brick at sixel `x`, `y`, or null. */
  #brickAt(x: number, y: number): number | null {
    const row = Math.floor((y - BRICKS_TOP) / (BRICK_HEIGHT + BRICK_GAP));
    const column = Math.floor(x / (BRICK_WIDTH + BRICK_GAP));
    if (row < 0 || row >= BRICK_ROWS || column < 0 || column >= BRICKS_ACROSS) {
      return null;
    }
    return row * BRICKS_ACROSS + column;
  }

  protected step(state: BreakoutState): BreakoutState {
    const bat = Math.min(FIELD_ACROSS - BAT_WIDTH, Math.max(0, state.bat + state.moving * BAT_STEP));
    let { x: dx, y: dy } = state.heading;
    let next = { x: state.ball.x + dx, y: state.ball.y + dy };
    if (next.x < 0 || next.x >= FIELD_ACROSS) {
      dx = -dx;
      next = { x: state.ball.x + dx, y: next.y };
    }
    if (next.y < 0) {
      dy = -dy;
      next = { x: next.x, y: state.ball.y + dy };
    }
    const batRow = this.down - 1;
    if (next.y === batRow && next.x >= bat - 1 && next.x <= bat + BAT_WIDTH) {
      // Off the bat's ends the ball goes out the way it came from.
      dy = -1;
      dx = next.x < bat + BAT_WIDTH / 2 ? -1 : 1;
      next = { x: next.x, y: batRow - 1 };
    }
    let { bricks, score } = state;
    const hit = this.#brickAt(next.x, next.y);
    if (hit !== null && bricks.has(hit)) {
      bricks = new Set([...bricks].filter((brick) => brick !== hit));
      score += POINTS_A_BRICK;
      dy = -dy;
    }
    if (next.y >= this.down) {
      const balls = state.balls - 1;
      return { ...state, ...this.#serve(), bat, bricks, score, balls, over: balls === 0 };
    }
    // A cleared wall is built again, and the game goes on.
    return { ...state, bat, ball: next, heading: { x: dx, y: dy }, bricks: bricks.size === 0 ? this.fresh().bricks : bricks, score };
  }

  protected draw(sixels: Sixels, state: BreakoutState): void {
    for (const brick of state.bricks) {
      const left = (brick % BRICKS_ACROSS) * (BRICK_WIDTH + BRICK_GAP);
      const top = BRICKS_TOP + Math.floor(brick / BRICKS_ACROSS) * (BRICK_HEIGHT + BRICK_GAP);
      for (let y = 0; y < BRICK_HEIGHT; y += 1) {
        for (let x = 0; x < BRICK_WIDTH; x += 1) {
          sixels.set(left + x, top + y, true);
        }
      }
    }
    for (let x = 0; x < BAT_WIDTH; x += 1) {
      sixels.set(state.bat + x, this.down - 1, true);
    }
    sixels.set(state.ball.x, state.ball.y, true);
    for (let ball = 1; ball < state.balls; ball += 1) {
      sixels.set(FIELD_ACROSS - ball * SPARE_BALL_CELLS, 0, true);
    }
  }

  protected steer(event: KeyEvent): Partial<BreakoutState> | null {
    if (event.key !== Key.Left && event.key !== Key.Right) {
      return null;
    }
    if (!isPress(event, event.key)) {
      return { moving: 0 };
    }
    return { moving: event.key === Key.Left ? -1 : 1 };
  }
}
