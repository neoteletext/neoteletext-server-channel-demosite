// Audio, magazine 5: instruments to play and a radio.

import type { Area } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { drumsPage, pianoPage, radioPage, synthPage, trackerPage } from "./audio-pages.ts";

export const AUDIO: Area = {
  name: "Audio",
  about: "Piano, drums, synth, tracker, radio",
  look: LOOKS.audio,
  menu: PAGES.audio,
  pages: () => [
    { spec: pianoPage(), about: "An octave on the letter keys" },
    { spec: drumsPage(), about: "Six pads on 1 to 6" },
    { spec: synthPage(), about: "Choose a wave and a note" },
    { spec: trackerPage(), about: "Write a tune and play it" },
    { spec: radioPage(), about: "Three tunes, streamed live" },
  ],
};
