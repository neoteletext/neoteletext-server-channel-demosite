// The short sounds the pages play: made once, each named once in the channel.

import { noise, sequence, sound, tone } from "neoteletext-server-ts-ui-components";

/** Hz of the notes the effects are made of: C5, E5, G5, C6, and a low A. */
const C5 = 523;
const E5 = 659;
const G5 = 784;
const C6 = 1047;
const LOW_A = 110;
/** Milliseconds of a blip, and of a longer note. */
const BLIP_MS = 40;
const NOTE_MS = 90;
const LONG_MS = 300;
/** The gain of the noise bursts, quieter than a tone. */
const NOISE_GAIN = 0.6;

export const SOUNDS = {
  right: sound("right", sequence(tone(C5, NOTE_MS), tone(E5, NOTE_MS), tone(G5, NOTE_MS), tone(C6, LONG_MS))),
  wrong: sound("wrong", tone(LOW_A, LONG_MS, "square")),
  blip: sound("blip", tone(C6, BLIP_MS, "square")),
  eat: sound("eat", sequence(tone(G5, BLIP_MS), tone(C6, BLIP_MS))),
  crash: sound("crash", noise(LONG_MS, NOISE_GAIN)),
} as const;
