// What the channel knows of the viewer (viewer-state.md VS-401): whether this
// tab presents a viewer, and whether they chose to be remembered. The page
// never shows the handle itself (VS-409); it says only that there is one.
// A viewer the channel does not know can ask to be known, a gesture after
// which the library asks for their state (VS-212, VS-407).

import { Colour } from "neoteletext-server-ts-protocol";
import { Button, type Child, DoubleHeight, Gap, h, Paragraph, Rows } from "neoteletext-server-ts-ui-components";
import { ViewerAware } from "./viewer-words.ts";

/** What each state is called on the page, and what it means. */
const SAID = {
  none: ["Not known", "This tab carries no viewer: the channel keeps nothing for you beyond this tab, and forgets it when you close it."],
  visit: ["Known for this visit", "Your browser gave this channel a key of its own for this visit. Your tabs here share it; it goes when the browser closes."],
  remembered: ["Remembered", "You chose to be remembered here: your browser keeps this channel's key across closing it, until you forget the channel."],
} as const;

export class WhatWeKnow extends ViewerAware {
  override render(): Child {
    const [big, line] = SAID[this.known];
    return h(
      Rows,
      {},
      h(DoubleHeight, { text: big, foreground: Colour.Yellow }),
      h(Gap, {}),
      h(Paragraph, { text: line, lines: 4 }),
      h(Gap, {}),
      h(Paragraph, {
        text: "The channel is given a handle for your browser, never your browser's key, and never the same handle as another channel. It shows here only whether there is one.",
        foreground: Colour.Cyan,
        lines: 4,
      }),
      h(Gap, {}),
      this.known === "none"
        ? h(Button, {
            label: "Let this channel know you",
            onPress: (connection) => {
              this.services.wantState(connection);
            },
          })
        : h(Paragraph, { text: "Forget me, on its own page, ends it.", lines: 1 }),
    );
  }
}
