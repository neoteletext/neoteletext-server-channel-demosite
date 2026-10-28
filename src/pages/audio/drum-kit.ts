// The drum machine's kit: each drum a sound made of tones and noise.

import { noise, sequence, sound, type Sound, tone } from "neoteletext-server-ts-ui-components";

/** Each drum's pitch in Hz, length in milliseconds and loudness, as tuned by ear. */
const KICK_HZ = 55;
const KICK_MS = 160;
const SNARE_MS = 140;
const HAT_MS = 40;
const HAT_GAIN = 0.4;
const CLAP_MS = 25;
const TOM_HZ = 140;
const TOM_MS = 200;
const COWBELL_HZ = 800;
const COWBELL_MS = 120;
const QUIET = 0.5;

export interface Drum {
  readonly name: string;
  readonly sound: Sound;
}

export const KIT: readonly Drum[] = [
  { name: "Kick", sound: sound("drum-kick", tone(KICK_HZ, KICK_MS)) },
  { name: "Snare", sound: sound("drum-snare", sequence(tone(TOM_HZ * 2, CLAP_MS, "triangle"), noise(SNARE_MS))) },
  { name: "Hat", sound: sound("drum-hat", noise(HAT_MS, HAT_GAIN)) },
  { name: "Clap", sound: sound("drum-clap", sequence(noise(CLAP_MS), noise(CLAP_MS, QUIET), noise(CLAP_MS))) },
  { name: "Tom", sound: sound("drum-tom", tone(TOM_HZ, TOM_MS)) },
  { name: "Cowbell", sound: sound("drum-cowbell", tone(COWBELL_HZ, COWBELL_MS, "square", QUIET)) },
];
