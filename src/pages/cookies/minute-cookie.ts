// A cookie that lasts sixty seconds: its value is when it lapses, so the page
// counts down to it each second, and says when it has lapsed. A lapsed
// cookie is one the browser no longer sends: the channel is given it again
// only when a connection opens, so the page tells lapse by the clock.

import { Colour } from "neoteletext-server-ts-protocol";
import { Button, type Child, Component, DoubleHeight, Gap, h, Paragraph, Rows, Text } from "neoteletext-server-ts-ui-components";
import { clockOf, COOKIES, MINUTE_SECONDS, MS_A_SECOND, numberIn, SITE_WIDE } from "./cookie-names.ts";

export class MinuteCookie extends Component {
  override componentDidMount(): void {
    // A tick a second draws the count down; nothing is kept but the cookie.
    this.setInterval(() => {
      this.forceUpdate();
    }, MS_A_SECOND);
  }

  /** When the viewer's cookie lapses, or null when they have none that says. */
  get #lapses(): number | null {
    // Unmounted (the probe of the page's needs), there is no viewer and no service to ask.
    const session = this.mounted ? this.services.session : null;
    return session === null ? null : numberIn(this.services.cookies(session)[COOKIES.minute]);
  }

  #status(): readonly [big: string, line: string] {
    const lapses = this.#lapses;
    if (lapses === null) {
      return ["No cookie", "Press the button to set one."];
    }
    const left = Math.ceil((lapses - this.services.epochMs()) / MS_A_SECOND);
    return left > 0 ? [`${left} seconds left`, `It lapses at ${clockOf(lapses)} UTC.`] : ["Lapsed", `It lapsed at ${clockOf(lapses)} UTC.`];
  }

  override render(): Child {
    const [big, line] = this.#status();
    return h(
      Rows,
      {},
      h(Paragraph, {
        text: "This cookie is set with a max age of 60 seconds. Its value is the time it lapses, so the page can count down to it.",
        foreground: Colour.Cyan,
        lines: 3,
      }),
      h(Gap, {}),
      h(DoubleHeight, { text: big, foreground: Colour.Yellow }),
      h(Text, { text: line }),
      h(Gap, {}),
      h(Button, {
        label: "Set it for 60 seconds",
        onPress: (session) => {
          const lapses = this.services.epochMs() + MINUTE_SECONDS * MS_A_SECOND;
          this.services.setCookie(session, COOKIES.minute, String(lapses), { ...SITE_WIDE, maxAge: MINUTE_SECONDS });
          this.forceUpdate();
        },
      }),
      h(Gap, {}),
      h(Paragraph, {
        text: "Once it lapses the browser stops sending it: open the cookie list after a reconnect and it is gone.",
        lines: 3,
      }),
    );
  }
}
