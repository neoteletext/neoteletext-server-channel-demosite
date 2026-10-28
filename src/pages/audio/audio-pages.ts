// The audio pages: the piano, the drums, the synth, the tracker and the radio.

import { h, type PageSpec } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { DrumPads } from "./drum-pads.ts";
import { Piano } from "./piano.ts";
import { audioPrompts } from "./prompts.ts";
import { Radio } from "./radio.ts";
import { Synth } from "./synth.ts";
import { Tracker } from "./tracker.ts";

export function pianoPage(): PageSpec {
  return {
    page: PAGES.piano,
    title: "Piano",
    root: () =>
      frame({ look: LOOKS.audio, title: "Piano", prompts: audioPrompts(["Drums", PAGES.drums], ["Synth", PAGES.synth]) }, h(Piano, { autoFocus: true })),
  };
}

export function drumsPage(): PageSpec {
  return {
    page: PAGES.drums,
    title: "Drum machine",
    root: () => frame({ look: LOOKS.audio, title: "Drum machine", prompts: audioPrompts(["Piano", PAGES.piano], ["Tracker", PAGES.tracker]) }, h(DrumPads, {})),
  };
}

export function synthPage(): PageSpec {
  return {
    page: PAGES.synth,
    title: "Synth",
    root: () => frame({ look: LOOKS.audio, title: "Synth", prompts: audioPrompts(["Piano", PAGES.piano], ["Tracker", PAGES.tracker]) }, h(Synth, {})),
  };
}

export function trackerPage(): PageSpec {
  return {
    page: PAGES.tracker,
    title: "Tracker",
    root: () =>
      frame({ look: LOOKS.audio, title: "Tracker", prompts: audioPrompts(["Radio", PAGES.radio], ["Drums", PAGES.drums]) }, h(Tracker, { autoFocus: true })),
  };
}

export function radioPage(): PageSpec {
  return {
    page: PAGES.radio,
    title: "Radio",
    perViewer: true,
    root: () => frame({ look: LOOKS.audio, title: "Radio Teletext", prompts: audioPrompts(["Tracker", PAGES.tracker], ["Piano", PAGES.piano]) }, h(Radio, {})),
  };
}
