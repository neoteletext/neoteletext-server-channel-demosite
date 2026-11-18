// The visit counter: a count kept for the viewer (Component.keptAs, under
// their handle, viewer-state.md VS-405), one more each time they open the
// page. Their other tabs share it and it is there when they come back; a
// tab the channel does not know counts for itself alone, until the viewer
// acts and is known (VS-407).

import { Colour } from "neoteletext-server-ts-protocol";
import { Button, type Child, DoubleHeight, Gap, h, type KeptAs, Paragraph, Rows } from "neoteletext-server-ts-ui-components";
import { ViewerAware } from "./viewer-words.ts";

interface VisitCounterState {
  /** The visits counted with this one. */
  readonly count: number;
}

export class VisitCounter extends ViewerAware<object, VisitCounterState> {
  override state: VisitCounterState = { count: 0 };

  override keptAs(): KeptAs {
    return { key: "visits", version: 1 };
  }

  override componentDidMount(): void {
    super.componentDidMount();
    this.setState({ count: this.state.count + 1 });
  }

  override render(): Child {
    return h(
      Rows,
      {},
      h(DoubleHeight, { text: `Visit number ${this.state.count}`, foreground: Colour.Yellow }),
      h(Gap, {}),
      h(Paragraph, {
        text:
          this.known === "none"
            ? "This tab is not known to the channel, so the count is this tab's alone. Press the button and the channel asks to know you; then it is yours."
            : "The count is kept for you: your other tabs share it, and it is here when you come back.",
        lines: 5,
      }),
      h(Gap, {}),
      h(Button, {
        label: "Start again from none",
        onPress: () => {
          this.setState({ count: 0 });
        },
      }),
    );
  }
}
