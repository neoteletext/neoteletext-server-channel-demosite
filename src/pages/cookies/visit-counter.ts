// The visit counter: a count kept in the viewer's `visits` cookie, one more
// each time they open the page, for a year, so it survives closing the
// browser and comes back on the next visit.

import { Colour } from "neoteletext-server-ts-protocol";
import { Button, type Child, Component, DoubleHeight, Gap, h, Paragraph, Rows } from "neoteletext-server-ts-ui-components";
import { COOKIES, numberIn, SITE_WIDE, YEAR_SECONDS } from "./cookie-names.ts";

interface VisitCounterState {
  /** The visits counted with this one, or null before the page has counted. */
  readonly count: number | null;
}

export class VisitCounter extends Component<object, VisitCounterState> {
  override state: VisitCounterState = { count: null };

  override componentDidMount(): void {
    const { session } = this.services;
    if (session === null) {
      return;
    }
    const count = (numberIn(this.services.cookies(session)[COOKIES.visits]) ?? 0) + 1;
    this.services.setCookie(session, COOKIES.visits, String(count), { ...SITE_WIDE, maxAge: YEAR_SECONDS });
    this.setState({ count });
  }

  override render(): Child {
    const { count } = this.state;
    return h(
      Rows,
      {},
      h(DoubleHeight, { text: count === null ? "Counting" : `Visit number ${count}`, foreground: Colour.Yellow }),
      h(Gap, {}),
      h(Paragraph, {
        text: "Each time you open this page the channel reads the visits cookie, adds one and sets it again, kept for a year. Leave and come back, or close the browser: the count goes on.",
        lines: 5,
      }),
      h(Gap, {}),
      h(Button, {
        label: "Start again from none",
        onPress: (session) => {
          this.services.setCookie(session, COOKIES.visits, "", { ...SITE_WIDE, maxAge: 0 });
          this.setState({ count: 0 });
        },
      }),
    );
  }
}
