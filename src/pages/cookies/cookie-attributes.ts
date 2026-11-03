// What each of a cookie's attributes does (RFC 6265bis, as the protocol's
// `cookie` message carries them, the server's docs/applications.md
// section 3), and the names the server keeps: text in a scrolling view.

import { Colour, COLUMNS } from "neoteletext-server-ts-protocol";
import { BAR_CELLS, BODY_ROWS, type Child, Component, type Element, h, ScrollView, Text } from "neoteletext-server-ts-ui-components";
import { linesOf } from "../languages/language-page.ts";

/** A line's cells: the row less the view's bar and the cell of the line's colour. */
const LINE_CELLS = COLUMNS - BAR_CELLS - 1;

/** Each attribute's name, and what it does. */
const ATTRIBUTES: readonly (readonly [name: string, what: string])[] = [
  ["Path", "The addresses under the channel the cookie is sent for. Every cookie here, the language cookie too, has /: the whole channel."],
  ["Max age", "How many seconds it lasts. None: it lasts until the browser closes, a session cookie. 0 removes it at once."],
  ["SameSite", "Strict, Lax or None: whether it goes with a request another channel starts. Lax, as here, sends it when a link is followed, not otherwise."],
  ["Secure", "Sent only over an encrypted connection: https and wss."],
  ["HttpOnly", "On the web, kept from a page's scripts. A teletext page runs none."],
  ["Names from _", "Names starting with _ are the server's own. It never gives them to a channel, and a channel does not set them."],
  ["Tabs", "Every tab on a channel shares its cookies; a private tab has its own (REQ-714)."],
  ["How many", "When a connection opens the server gives the channel at most 50 cookies: those that connection was opened with."],
];

export class CookieAttributes extends Component {
  #units(): Element[] {
    const units: Element[] = [];
    for (const [place, [name, what]] of ATTRIBUTES.entries()) {
      units.push(h(Text, { key: `name ${place}`, text: name, foreground: Colour.Yellow }));
      for (const [at, line] of linesOf(what, LINE_CELLS).entries()) {
        units.push(h(Text, { key: `what ${place} ${at}`, text: line }));
      }
      units.push(h(Text, { key: `gap ${place}`, text: "" }));
    }
    return units;
  }

  override render(): Child {
    return h(ScrollView, { shown: BODY_ROWS, autoFocus: true }, ...this.#units());
  }
}
