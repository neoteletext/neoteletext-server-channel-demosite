// A piano of an octave from middle C: the home row's letters are the white
// keys and the row above the black, as on a tracker's keyboard; a click
// on a key plays it as well.

import { Colour } from "neoteletext-server-ts-protocol";
import {
  type Canvas,
  Control,
  type ControlProps,
  type KeyEvent,
  type KeyHelpEntry,
  type PointerEvent,
  type Size,
  sound,
  type Sound,
  tone,
  typedText,
} from "neoteletext-server-ts-ui-components";
import { frequencyOf, MIDDLE_C, nameOf } from "./notes.ts";

/** The keys of the octave, C to C, by their letters: white then black, as they lie on the keyboard. */
const KEYS = [
  { letter: "a", semitone: 0, black: false },
  { letter: "w", semitone: 1, black: true },
  { letter: "s", semitone: 2, black: false },
  { letter: "e", semitone: 3, black: true },
  { letter: "d", semitone: 4, black: false },
  { letter: "f", semitone: 5, black: false },
  { letter: "t", semitone: 6, black: true },
  { letter: "g", semitone: 7, black: false },
  { letter: "y", semitone: 8, black: true },
  { letter: "h", semitone: 9, black: false },
  { letter: "u", semitone: 10, black: true },
  { letter: "j", semitone: 11, black: false },
  { letter: "k", semitone: 12, black: false },
] as const;
const NOTE_MS = 400;
/** A white key's cells across, and the keyboard's rows: the black keys' and the white's. */
const KEY_CELLS = 4;
const BLACK_ROWS = 3;
const WHITE_ROWS = 2;
/** A white key's chip after its colour's cell: a space and its letter. */
const WHITE_LABEL_CELLS = 2;
/** The row under the keyboard that names the note played. */
const PLAYED_ROW = BLACK_ROWS + WHITE_ROWS + 1;

/** Each key's sound, made once. */
const NOTES: readonly Sound[] = KEYS.map((key) => sound(`piano-${key.semitone}`, tone(frequencyOf(MIDDLE_C + key.semitone), NOTE_MS, "triangle")));

/** The white keys before key `index`: where it lies across. */
function whiteBefore(index: number): number {
  return KEYS.slice(0, index).filter((key) => !key.black).length;
}

interface PianoState {
  /** The key last played, by its place in KEYS. */
  readonly played: number | null;
}

export class Piano extends Control<ControlProps, PianoState> {
  override state: PianoState = { played: null };

  override keyBindings(): readonly KeyHelpEntry[] {
    return [
      ["A to K, W E T Y U", "play"],
      ["Click", "plays"],
    ];
  }

  #play(index: number, session: number): void {
    const note = NOTES[index];
    if (note !== undefined) {
      this.services.play(note, session);
      this.setState({ played: index });
    }
  }

  override measure(space: Size): Size {
    return { width: space.width, height: Math.min(space.height, PLAYED_ROW + 1) };
  }

  override paint(canvas: Canvas): void {
    KEYS.forEach((key, index) => {
      const at = whiteBefore(index) * KEY_CELLS;
      const lit = this.state.played === index;
      if (key.black) {
        // A black key sits over the gap between two white ones.
        const column = at - 1;
        for (let row = 0; row < BLACK_ROWS; row += 1) {
          canvas.chip(row, column, lit ? Colour.Red : Colour.Blue, Colour.White, row === BLACK_ROWS - 1 ? key.letter.toUpperCase() : " ");
        }
        canvas.control(0, column + 1, 1, BLACK_ROWS, String(index));
        return;
      }
      for (let row = BLACK_ROWS; row < BLACK_ROWS + WHITE_ROWS; row += 1) {
        canvas.chip(row, at, lit ? Colour.Yellow : Colour.White, Colour.Black, row === BLACK_ROWS + WHITE_ROWS - 1 ? ` ${key.letter.toUpperCase()}` : "  ");
      }
      canvas.control(BLACK_ROWS, at + 1, WHITE_LABEL_CELLS, WHITE_ROWS, String(index));
    });
    const played = this.state.played === null ? null : KEYS[this.state.played];
    canvas.coloured(PLAYED_ROW, 0, Colour.Cyan, played === null || played === undefined ? "Play a note" : `Played ${nameOf(MIDDLE_C + played.semitone)}`);
  }

  override onKey(event: KeyEvent): boolean {
    const typed = typedText(event)?.toLowerCase();
    const index = KEYS.findIndex((key) => key.letter === typed);
    if (index < 0) {
      return false;
    }
    this.#play(index, event.session);
    return true;
  }

  override onClick(event: PointerEvent): boolean {
    if (event.region === undefined) {
      return false;
    }
    this.#play(Number(event.region), event.session);
    return true;
  }
}
