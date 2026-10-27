// Notes by their MIDI numbers, and their frequencies in equal temperament.

/** A4, MIDI 69, is 440 Hz. */
const A4 = 69;
const A4_HZ = 440;
const SEMITONES = 12;
/** Middle C. */
export const MIDDLE_C = 60;

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export function frequencyOf(note: number): number {
  return A4_HZ * 2 ** ((note - A4) / SEMITONES);
}

/** A note's name and octave, such as C4. */
export function nameOf(note: number): string {
  // MIDI's octaves start at -1: note 0 is C-1.
  return `${NAMES[note % SEMITONES] ?? ""}${Math.floor(note / SEMITONES) - 1}`;
}
