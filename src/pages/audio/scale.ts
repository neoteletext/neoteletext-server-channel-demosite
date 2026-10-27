// The notes the tracker and the radio's tunes are written in: C major
// from middle C, an octave, highest first as the tracker shows them.

import { MIDDLE_C } from "./notes.ts";

/** C major's semitones from its C. */
const MAJOR = [0, 2, 4, 5, 7, 9, 11, 12] as const;

export const SCALE: readonly number[] = MAJOR.map((semitone) => MIDDLE_C + semitone).toReversed();
