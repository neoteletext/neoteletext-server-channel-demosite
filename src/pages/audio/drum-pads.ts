// The drum pads: a button each, and the digits 1 to 6 play them too.

import { Colour } from "neottx-server-ts-protocol";
import { Button, type Child, Component, digitOf, Grid, h, type KeyEvent, type PageNeeds, Text } from "neottx-server-ts-ui-components";
import { KIT } from "./drum-kit.ts";

const PADS_ACROSS = 3;
const PAD_CELLS = 12;
const PAD_COLOURS = [Colour.Red, Colour.Green, Colour.Yellow, Colour.Blue, Colour.Magenta, Colour.Cyan] as const;

interface DrumPadsState {
  /** The drum last hit's name. */
  readonly hit: string;
}

export class DrumPads extends Component<object, DrumPadsState> {
  override state: DrumPadsState = { hit: "" };

  override focusable(): boolean {
    return true;
  }

  override needs(): PageNeeds {
    return { digits: true, ownCopy: true };
  }

  override hint(): string {
    return "1-6 or a click plays a drum";
  }

  #hit(index: number, session: number): void {
    const drum = KIT[index];
    if (drum !== undefined) {
      this.services.play(drum.sound, session);
      this.setState({ hit: drum.name });
    }
  }

  override onKey(event: KeyEvent): boolean {
    const digit = digitOf(event);
    if (digit === null || digit < 1 || digit > KIT.length) {
      return false;
    }
    this.#hit(digit - 1, event.session);
    return true;
  }

  override render(): Child {
    return [
      h(
        Grid,
        { key: "pads", columns: PADS_ACROSS },
        ...KIT.map((drum, index) =>
          h(Button, {
            key: drum.name,
            label: `${index + 1} ${drum.name}`,
            width: PAD_CELLS,
            background: PAD_COLOURS[index] ?? Colour.Blue,
            onPress: (session: number) => {
              this.#hit(index, session);
            },
          }),
        ),
      ),
      h(Text, { key: "hit", text: this.state.hit === "" ? "" : `Hit: ${this.state.hit}`, foreground: Colour.Yellow }),
    ];
  }
}
