// A countdown to the new year.

import { Colour } from "neoteletext-server-ts-protocol";
import { type Child, Component, Countdown, h, Text } from "neoteletext-server-ts-ui-components";

/** The new year after `epochMs`, UTC. */
function nextNewYear(epochMs: number): number {
  return Date.UTC(new Date(epochMs).getUTCFullYear() + 1, 0, 1);
}

export class NewYear extends Component {
  override render(): Child {
    return [
      h(Text, { key: "label", text: "To the new year: days, hours, minutes, seconds", foreground: Colour.Cyan }),
      h(Countdown, { key: "countdown", until: nextNewYear(this.mounted ? this.services.epochMs() : 0) }),
    ];
  }
}
