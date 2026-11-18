// Forget me (viewer-state.md VS-409, VS-702): ends the viewer's state on this
// channel and deletes at once all the channel keeps for them. Their browser
// deletes its key for the channel, and every tab of theirs here is then not
// known.

import { Colour } from "neoteletext-server-ts-protocol";
import { Button, type Child, DoubleHeight, Gap, h, Paragraph, Rows } from "neoteletext-server-ts-ui-components";
import { ViewerAware } from "./viewer-words.ts";

export class ForgetMe extends ViewerAware {
  override render(): Child {
    const known = this.known !== "none";
    return h(
      Rows,
      {},
      h(DoubleHeight, { text: known ? "Forget me" : "Nothing to forget", foreground: Colour.Yellow }),
      h(Gap, {}),
      h(Paragraph, {
        text: known
          ? "The button ends what this channel knows of you and deletes, at once, everything it keeps for you: your poll vote, your visit count, your language."
          : "This tab is not known to the channel: it keeps nothing for you beyond this tab.",
        lines: 5,
      }),
      h(Gap, {}),
      known
        ? h(Button, {
            label: "Forget me now",
            onPress: (connection) => {
              this.services.forgetViewer(connection);
            },
          })
        : h(Paragraph, { text: "Your browser can also forget this channel at any time.", foreground: Colour.Cyan, lines: 2 }),
    );
  }
}
