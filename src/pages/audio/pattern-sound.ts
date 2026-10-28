// A pattern of notes as one sound: each step its note, or silence.

import { RATE, sequence, sound, type Sound, tone } from "neoteletext-server-ts-ui-components";
import { frequencyOf } from "./notes.ts";

const SECOND_MS = 1_000;

/** The sound of `steps`, each a MIDI note or null for a rest, `stepMs` each, named `name` and its notes. */
export function patternSound(name: string, steps: readonly (number | null)[], stepMs: number): Sound {
  const rest = new Int16Array(Math.round((RATE * stepMs) / SECOND_MS));
  return sound(
    `${name}-${steps.map((step) => step ?? "-").join(".")}`,
    sequence(...steps.map((step) => (step === null ? rest : tone(frequencyOf(step), stepMs, "square")))),
  );
}
