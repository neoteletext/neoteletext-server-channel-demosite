// A synth: a wave, a note and a length chosen, and a button that plays it.

import { Colour } from "neoteletext-server-ts-protocol";
import { Button, type Child, Component, h, RadioGroup, Slider, sound, Text, tone, type Wave } from "neoteletext-server-ts-ui-components";
import { frequencyOf, MIDDLE_C, nameOf } from "./notes.ts";

const WAVES: readonly Wave[] = ["sine", "square", "triangle"];
/** The notes it plays: two octaves from C3. */
const LOWEST = MIDDLE_C - 12;
const HIGHEST = MIDDLE_C + 12;
/** Lengths in milliseconds, in steps; each is a sound of its own, so the steps bound how many there are. */
const SHORTEST_MS = 100;
const LONGEST_MS = 1_000;
const LENGTH_STEP_MS = 100;
const START_MS = 300;

interface SynthState {
  readonly wave: number;
  readonly note: number;
  readonly length: number;
}

export class Synth extends Component<object, SynthState> {
  override state: SynthState = { wave: 0, note: MIDDLE_C, length: START_MS };

  #play(session: number): void {
    const wave = WAVES[this.state.wave] ?? "sine";
    const { note, length } = this.state;
    this.services.play(sound(`synth-${wave}-${note}-${length}`, tone(frequencyOf(note), length, wave)), session);
  }

  override render(): Child {
    return [
      h(Text, { key: "wave-label", text: "Wave", foreground: Colour.Cyan }),
      h(RadioGroup, {
        key: "wave",
        items: WAVES,
        across: true,
        value: this.state.wave,
        onChange: (wave: number) => {
          this.setState({ wave });
        },
      }),
      h(Slider, {
        key: "note",
        label: `Note ${nameOf(this.state.note)}`,
        min: LOWEST,
        max: HIGHEST,
        value: this.state.note,
        onChange: (note: number) => {
          this.setState({ note });
        },
      }),
      h(Slider, {
        key: "length",
        label: "Length",
        min: SHORTEST_MS,
        max: LONGEST_MS,
        step: LENGTH_STEP_MS,
        unit: "ms",
        value: this.state.length,
        onChange: (length: number) => {
          this.setState({ length });
        },
      }),
      h(Button, {
        key: "play",
        label: "Play",
        background: Colour.Magenta,
        onPress: (session: number) => {
          this.#play(session);
        },
      }),
    ];
  }
}
