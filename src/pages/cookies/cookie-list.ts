// Every cookie the channel holds for the viewer, the language cookie
// included, in a list: choosing one removes it (a max age of 0). The
// server's own cookies, named from `_`, are never given to a channel, so
// they are not here.

import { Colour } from "neoteletext-server-ts-protocol";
import { Button, type Child, ChoiceList, Component, ENGLISH, Gap, h, Paragraph, Rows } from "neoteletext-server-ts-ui-components";
import { SITE_WIDE, shown } from "./cookie-names.ts";

/** The rows the list shows; the rest scroll. */
const LIST_ROWS = 12;

export class CookieList extends Component {
  /** The viewer's cookies, by name. */
  #cookies(): [name: string, value: string][] {
    // Unmounted (the probe of the page's needs), there is no viewer and no service to ask.
    const session = this.mounted ? this.services.session : null;
    return session === null ? [] : Object.entries(this.services.cookies(session)).toSorted(([a], [b]) => a.localeCompare(b, "en"));
  }

  #remove(session: number, name: string): void {
    this.services.setCookie(session, name, "", { ...SITE_WIDE, maxAge: 0 });
    this.forceUpdate();
  }

  override render(): Child {
    const cookies = this.#cookies();
    return h(
      Rows,
      {},
      h(Paragraph, { text: "Your cookies on this channel. Choose one to remove it.", foreground: Colour.Cyan, lines: 1 }),
      h(Gap, {}),
      h(ChoiceList<[string, string]>, {
        items: cookies,
        shown: LIST_ROWS,
        autoFocus: true,
        empty: "No cookies",
        itemKey: ([name]) => name,
        // Names and values are what the browser holds, read as they are written, never as the language's stand-in.
        language: ENGLISH,
        text: ([name, value]) => `${shown(name)}=${shown(value)}`,
        onChoose: (index, session) => {
          const chosen = cookies[index];
          if (chosen !== undefined) {
            this.#remove(session, chosen[0]);
          }
        },
      }),
      h(Gap, {}),
      h(Button, {
        label: "Remove them all",
        onPress: (session) => {
          for (const [name] of cookies) {
            this.#remove(session, name);
          }
        },
      }),
      h(Paragraph, { text: "Removing language shows the site in English again.", lines: 1 }),
    );
  }
}
