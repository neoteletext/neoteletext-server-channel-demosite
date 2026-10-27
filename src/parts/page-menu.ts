// A menu of pages: each a link a click follows, with a few words under it.

import { Colour } from "neottx-server-ts-protocol";
import { type Child, Component, h, PageLink, Rows, Text } from "neottx-server-ts-ui-components";

/** One entry: its page, its name, and what is there. */
export interface MenuEntry {
  readonly page: number;
  readonly label: string;
  readonly about: string;
}

/** The about line's indent: under the label, past the page number. */
const ABOUT_INDENT = "    ";

export class PageMenu extends Component<{ readonly entries: readonly MenuEntry[] }> {
  override render(): Child {
    return this.props.entries.map((entry) =>
      h(
        Rows,
        { key: entry.page },
        h(PageLink, { page: entry.page, label: entry.label }),
        h(Text, { text: `${ABOUT_INDENT}${entry.about}`, foreground: Colour.Cyan }),
      ),
    );
  }
}
