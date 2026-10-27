// The radio's tunes, written in the scale's rows (0 the highest note,
// null a rest), each played round several times as one long sound.

import { RATE, type StreamSource } from "neottx-server-ts-ui-components";
import { patternSound } from "./pattern-sound.ts";
import { SCALE } from "./scale.ts";

interface Tune {
  readonly name: string;
  readonly stepMs: number;
  readonly rows: readonly (number | null)[];
}

const TUNES: readonly Tune[] = [
  { name: "Test card", stepMs: 220, rows: [7, 5, 3, 5, 4, 2, 0, null, 1, 3, 5, 3, 4, 6, 7, null] },
  { name: "Pages from Ceefax", stepMs: 160, rows: [3, null, 3, 4, 5, null, 5, 4, 3, 2, 1, null, 2, 3, 4, null] },
  { name: "Night shift", stepMs: 300, rows: [7, null, 4, null, 2, null, 4, null, 6, null, 3, null, 1, null, 0, null] },
];
/** The times each tune goes round. */
const ROUNDS = 6;

/** A tune as a live sound, every sample made at once. */
function tuneSource(tune: Tune): StreamSource {
  const rows = Array.from({ length: ROUNDS }, () => tune.rows).flat();
  const { samples } = patternSound(
    tune.name,
    rows.map((row) => (row === null ? null : (SCALE[row] ?? null))),
    tune.stepMs,
  );
  return { name: tune.name, rate: RATE, samples: () => samples, complete: true, failure: null, expected: samples.length };
}

/** A tune the radio plays: its name, and its sound, made when it is first asked for. */
export interface Track {
  readonly name: string;
  source(): StreamSource;
}

export const TRACKS: readonly Track[] = TUNES.map((tune) => ({ name: tune.name, source: () => tuneSource(tune) }));
