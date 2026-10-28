// Page 203, the guestbook: every viewer's signatures, and a field to sign.

import { Colour } from "neoteletext-server-ts-protocol";
import { type Child, Component, h, type PageSpec, Text, TextField } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import type { Unlisten } from "../../parts/listeners.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import type { Guestbook } from "./guestbook.ts";
import { interactivePrompts } from "./prompts.ts";

/** The longest message taken. */
const LONGEST_MESSAGE = 60;
/** The entries shown at once, two rows each. */
const SHOWN = 8;

class GuestbookView extends Component<{ readonly book: Guestbook }> {
  #unlisten: Unlisten | null = null;

  override componentDidMount(): void {
    this.#unlisten = this.props.book.listen(() => {
      this.forceUpdate();
    });
  }

  override componentWillUnmount(): void {
    this.#unlisten?.();
  }

  override render(): Child {
    const { book } = this.props;
    return [
      h(Text, { key: "say", text: "Type a message and press Enter:", foreground: Colour.Cyan }),
      h(TextField, {
        key: "field",
        longest: LONGEST_MESSAGE,
        placeholder: "your message",
        autoFocus: true,
        onSubmit: (message: string, session: number) => {
          const trimmed = message.trim();
          if (trimmed !== "") {
            book.sign({ name: `Viewer ${session}`, message: trimmed });
          }
        },
      }),
      // The newest first, each on a line of its own: its writer in yellow, what they said under it.
      ...book.entries
        .toReversed()
        .slice(0, SHOWN)
        .map((entry, place) => [
          h(Text, { key: `name${place}`, text: entry.name, foreground: Colour.Yellow }),
          h(Text, { key: `message${place}`, text: `  ${entry.message}` }),
        ]),
    ];
  }
}

export function guestbookPage(book: Guestbook): PageSpec {
  return {
    page: PAGES.guestbook,
    title: "Guestbook",
    root: () =>
      frame(
        { look: LOOKS.interactive, title: "Guestbook", prompts: interactivePrompts(["Poll", PAGES.poll], ["Paint", PAGES.paint]) },
        h(GuestbookView, { book }),
      ),
  };
}
