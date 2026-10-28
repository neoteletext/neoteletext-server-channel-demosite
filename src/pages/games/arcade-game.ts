// What the arcade's games share: a field of sixels drawn a frame a tick
// for each viewer, a score line under it, the arrows to steer, Enter to
// play again once it is over, and the score posted to the hall of fame.
// The copy every viewer shares is the title screen; a viewer's own plays.

import { Colour, COLUMNS, Key, Sixels, SIXELS_ACROSS, SIXELS_DOWN } from "neoteletext-server-ts-protocol";
import {
  type Canvas,
  cells,
  Control,
  type ControlProps,
  isPress,
  type KeyEvent,
  type KeyHelpEntry,
  type PointerEvent,
  type Size,
  type Sound,
} from "neoteletext-server-ts-ui-components";
import type { HallOfFame } from "./hall-of-fame.ts";

export interface ArcadeProps extends ControlProps {
  readonly hall: HallOfFame;
  /** The field's rows; the score line is under them. */
  readonly rows: number;
  readonly crash?: Sound;
}

/** What every game's state holds. */
export interface Play {
  readonly score: number;
  readonly over: boolean;
}

/** The field's sixels across: the page, but for the field's colour cell and the last cell. */
export const FIELD_ACROSS = (COLUMNS - 2) * SIXELS_ACROSS;
/** The space bar's key, as the server names it. */
export const SPACE_KEY = " ";
/** The region of the line that says a click plays again. */
const AGAIN = "again";

/** The sixels down a field of `rows`. */
function fieldDown(rows: number): number {
  return rows * SIXELS_DOWN;
}

export abstract class ArcadeGame<S extends Play> extends Control<ArcadeProps, S> {
  #timer = -1;

  /** The game's name, for the hall of fame. */
  protected abstract readonly game: string;
  /** Milliseconds a frame. */
  protected abstract readonly frameMs: number;
  protected abstract readonly colour: Colour;
  /** A new game, from the props alone: a game's state starts as one, before it is mounted. */
  protected abstract fresh(): S;
  /** The state a frame on. */
  protected abstract step(state: S): S;
  /** The field's sixels as they are. */
  protected abstract draw(sixels: Sixels, state: S): void;
  /** What a key does while it plays: the state it changes, or null for a key it does not take. */
  protected abstract steer(event: KeyEvent, state: S): Partial<S> | null;

  /** The sixels down the field. */
  protected get down(): number {
    return fieldDown(this.props.rows);
  }

  override componentDidMount(): void {
    super.componentDidMount();
    if (this.services.session !== null) {
      this.#timer = this.setInterval(() => {
        this.#frame();
      }, this.frameMs);
    }
  }

  override componentWillUnmount(): void {
    this.clearTimer(this.#timer);
  }

  #frame(): void {
    const { state } = this;
    if (state.over) {
      return;
    }
    const next = this.step(state);
    this.setState(next);
    const session = this.services.session;
    if (next.over && session !== null) {
      this.props.hall.post({ game: this.game, score: next.score, player: session });
      if (this.props.crash !== undefined) {
        this.services.play(this.props.crash, session);
      }
    }
  }

  override keyBindings(): readonly KeyHelpEntry[] {
    return [
      ["Arrows", "play"],
      ["Enter", "plays again"],
    ];
  }

  override measure(space: Size): Size {
    return { width: space.width, height: Math.min(space.height, this.props.rows + 1) };
  }

  override paint(canvas: Canvas): void {
    const sixels = new Sixels(FIELD_ACROSS, this.down);
    this.draw(sixels, this.state);
    canvas.sixels(0, 1, this.state.over ? Colour.Red : this.colour, sixels);
    const line = this.state.over ? `Score ${this.state.score}: over. Enter plays again` : `Score ${this.state.score}`;
    canvas.coloured(this.props.rows, 0, Colour.Yellow, line);
    if (this.state.over && !this.disabled) {
      canvas.control(this.props.rows, 1, cells(line), 1, AGAIN);
    }
  }

  override onKey(event: KeyEvent): boolean {
    if (this.state.over) {
      if (isPress(event, Key.Enter)) {
        this.setState(this.fresh());
        return true;
      }
      return false;
    }
    const change = this.steer(event, this.state);
    if (change === null) {
      return false;
    }
    this.setState(change);
    return true;
  }

  override onClick(event: PointerEvent): boolean {
    if (this.state.over && event.region === AGAIN) {
      this.setState(this.fresh());
      return true;
    }
    return false;
  }
}
