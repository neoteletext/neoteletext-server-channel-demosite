// A visit or remembered (viewer-state.md VS-106, VS-107, VS-208): what the
// channel keeps for a visit goes soon after its last use, and for a viewer
// who chose to be remembered it lasts much longer. The channel cannot make
// a viewer remembered; it can only ask the browser to offer it, which the
// viewer then accepts or not.

import { Colour } from "neoteletext-server-ts-protocol";
import { Button, type Child, Gap, h, Paragraph, Rows, Text } from "neoteletext-server-ts-ui-components";
import { REMEMBERED_KEPT, ViewerAware, VISIT_KEPT } from "./viewer-words.ts";

/** What the page says of the viewer now. */
const NOW = { none: "Now: not known", visit: "Now: a visit", remembered: "Now: remembered" } as const;

export class RememberMe extends ViewerAware {
  override render(): Child {
    const { known } = this;
    return h(
      Rows,
      {},
      h(Text, { text: NOW[known], foreground: Colour.Yellow }),
      h(Gap, {}),
      h(Paragraph, {
        text: `A visit lasts until the browser closes, and what the channel keeps for it goes ${VISIT_KEPT} after its last use.`,
        lines: 3,
      }),
      h(Gap, {}),
      h(Paragraph, {
        text: `Remembered, your browser keeps this channel's key, and what the channel keeps for you goes ${REMEMBERED_KEPT} after its last use.`,
        lines: 3,
      }),
      h(Gap, {}),
      known === "visit"
        ? h(Button, {
            label: "Ask to remember me",
            onPress: (connection) => {
              this.services.offerRemember(connection);
            },
          })
        : h(Paragraph, {
            text: known === "none" ? "First let the channel know you." : "Your browser remembers you here.",
            foreground: Colour.Cyan,
            lines: 1,
          }),
    );
  }
}
