// A tracker: sixteen steps, a note or none on each. The arrows move, Enter
// or a click puts a note on a step or takes it off, and P plays the
// pattern through.

import { Colour, Key } from "neottx-server-ts-protocol";
import {
  type Canvas,
  choosing,
  Control,
  type ControlProps,
  isPress,
  type KeyEvent,
  type PointerEvent,
  type Size,
  typedText,
} from "neottx-server-ts-ui-components";
import { nameOf } from "./notes.ts";
import { patternSound } from "./pattern-sound.ts";
import { SCALE } from "./scale.ts";

const STEPS = 16;
const STEP_MS = 180;
/** The note names' column, then a cell or two a step. */
const NAME_CELLS = 4;
const STEP_CELLS = 2;
/** The row under the grid that says what to do. */
const STATUS_ROW = SCALE.length + 1;
/** The steps of a beat: every fourth is marked. */
const BEAT = 4;
/** A step's note: not #, which the English character set shows as a pound sign. */
const NOTE_MARK = "*";

/** Where the cursor is: a step, and a note by its place in the scale. */
interface Cursor {
  readonly step: number;
  readonly row: number;
}

interface TrackerState {
  /** Each step's note's row in the scale, or null. */
  readonly steps: readonly (number | null)[];
  readonly cursor: Cursor;
}

/** A tune to start from, by rows of the scale (0 the highest). */
const START: readonly (number | null)[] = [7, null, 5, null, 3, null, 5, null, 7, 7, 7, null, 6, 6, 6, null];

/** A step's cell: its note, the cursor on an empty one, or the beat's mark. */
function cellMark(set: boolean, here: boolean, step: number): string {
  if (set) {
    return NOTE_MARK;
  }
  if (here) {
    return "+";
  }
  return step % BEAT === 0 ? ":" : ".";
}

function cellColour(set: boolean, here: boolean): Colour {
  if (here) {
    return Colour.Red;
  }
  return set ? Colour.Yellow : Colour.Blue;
}

export class Tracker extends Control<ControlProps, TrackerState> {
  override state: TrackerState = { steps: START, cursor: { step: 0, row: 0 } };

  protected override keysHint(): string {
    return "Arrows move, Enter sets a note, P plays";
  }

  #toggle(cursor: Cursor): void {
    const steps = this.state.steps.map((row, step) => {
      if (step !== cursor.step) {
        return row;
      }
      return row === cursor.row ? null : cursor.row;
    });
    this.setState({ steps, cursor });
  }

  #play(session: number): void {
    this.services.play(
      patternSound(
        "tracker",
        this.state.steps.map((row) => (row === null ? null : (SCALE[row] ?? null))),
        STEP_MS,
      ),
      session,
    );
  }

  override measure(space: Size): Size {
    return { width: space.width, height: Math.min(space.height, STATUS_ROW + 1) };
  }

  override paint(canvas: Canvas): void {
    SCALE.forEach((note, row) => {
      canvas.coloured(row, 0, Colour.Cyan, nameOf(note));
      for (let step = 0; step < STEPS; step += 1) {
        const set = this.state.steps[step] === row;
        const here = this.focused && this.state.cursor.step === step && this.state.cursor.row === row;
        const column = NAME_CELLS + step * STEP_CELLS;
        canvas.coloured(row, column, cellColour(set, here), cellMark(set, here, step));
        canvas.region(`${step}:${row}`, row, column + 1, 1);
      }
    });
    canvas.coloured(STATUS_ROW, 0, Colour.White, "P plays the pattern");
    canvas.control(STATUS_ROW, 1, "P plays the pattern".length, 1, "play");
  }

  override onKey(event: KeyEvent): boolean {
    const { step, row } = this.state.cursor;
    const moves: Readonly<Record<string, Cursor>> = {
      [Key.Left]: { step: (step + STEPS - 1) % STEPS, row },
      [Key.Right]: { step: (step + 1) % STEPS, row },
      [Key.Up]: { step, row: Math.max(0, row - 1) },
      [Key.Down]: { step, row: Math.min(SCALE.length - 1, row + 1) },
    };
    const moved = event.action === "release" ? undefined : moves[event.key];
    if (moved !== undefined) {
      this.setState({ cursor: moved });
      return true;
    }
    if (choosing(event) || isPress(event, Key.Enter)) {
      this.#toggle(this.state.cursor);
      return true;
    }
    if (typedText(event)?.toLowerCase() === "p") {
      this.#play(event.session);
      return true;
    }
    return false;
  }

  override onClick(event: PointerEvent): boolean {
    if (event.region === "play") {
      this.#play(event.session);
      return true;
    }
    const [step, row] = (event.region ?? "").split(":").map(Number);
    if (step === undefined || row === undefined || !Number.isInteger(step) || !Number.isInteger(row)) {
      return false;
    }
    this.#toggle({ step, row });
    return true;
  }
}
