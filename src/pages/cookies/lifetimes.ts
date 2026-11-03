// A session cookie beside a persistent one: the first has no max age and
// goes when the browser closes; the second is kept for thirty days.

import { Colour } from "neoteletext-server-ts-protocol";
import { Button, type Child, Component, Gap, h, Paragraph, Rows, Text } from "neoteletext-server-ts-ui-components";
import { clockOf, COOKIES, SITE_WIDE, shown, THIRTY_DAYS_SECONDS } from "./cookie-names.ts";

export class Lifetimes extends Component {
  /** What the viewer's cookie `name` holds, as the page shows it. */
  #value(name: string): string {
    // Unmounted (the probe of the page's needs), there is no viewer and no service to ask.
    const session = this.mounted ? this.services.session : null;
    const value = session === null ? undefined : this.services.cookies(session)[name];
    return value === undefined ? "not set" : `set at ${shown(value)}`;
  }

  /** Sets `name` to the time now, with `maxAge` or none. */
  #set(session: number, name: string, maxAge?: number): void {
    this.services.setCookie(session, name, clockOf(this.services.epochMs()), { ...SITE_WIDE, ...(maxAge === undefined ? {} : { maxAge }) });
    this.forceUpdate();
  }

  override render(): Child {
    return h(
      Rows,
      {},
      h(Paragraph, {
        text: "A session cookie has no max age: it lasts until the browser closes. A persistent one names how long it lasts, and stays across closing.",
        foreground: Colour.Cyan,
        lines: 4,
      }),
      h(Gap, {}),
      h(Text, { text: `Session: ${this.#value(COOKIES.session)}`, foreground: Colour.Yellow }),
      h(Button, {
        label: "Set the session cookie",
        onPress: (session) => {
          this.#set(session, COOKIES.session);
        },
      }),
      h(Gap, {}),
      h(Text, { text: `Persistent: ${this.#value(COOKIES.persistent)}`, foreground: Colour.Green }),
      h(Button, {
        label: "Set the 30-day cookie",
        onPress: (session) => {
          this.#set(session, COOKIES.persistent, THIRTY_DAYS_SECONDS);
        },
      }),
      h(Gap, {}),
      h(Paragraph, {
        text: "Set both, close the browser and come back: the session cookie is gone and the 30-day one is still here. Times are UTC.",
        lines: 3,
      }),
    );
  }
}
