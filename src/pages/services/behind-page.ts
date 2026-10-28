// Page 108, behind the scenes: the server's own figures, which it sends
// every ten seconds, as they arrive.

import { Colour, figuresIn, type Figures, type ServerStats } from "neoteletext-server-ts-protocol";
import { BarChart, type Child, Component, h, type PageSpec, Paragraph, Table, Text } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { servicesPrompts } from "./prompts.ts";

/** The figures shown of each object, and the pages charted. */
const MOST_FIGURES = 6;
const MOST_PAGES = 5;
const LABEL_CELLS = 22;

/** The whole numbers of `figures`, by name, as a table's rows. */
function wholeFigures(figures: Figures): [string, string][] {
  return Object.entries(figures)
    .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isSafeInteger(entry[1]))
    .slice(0, MOST_FIGURES)
    .map(([name, value]) => [name.replaceAll("_", " "), String(value)]);
}

interface BehindState {
  readonly stats: ServerStats | null;
}

class Behind extends Component<object, BehindState> {
  override state: BehindState = { stats: null };
  #unsubscribe: (() => void) | null = null;

  override componentDidMount(): void {
    this.#unsubscribe = this.services.bus.on("stats", (stats) => {
      this.setState({ stats });
    });
  }

  override componentWillUnmount(): void {
    this.#unsubscribe?.();
  }

  override render(): Child {
    const { stats } = this.state;
    if (stats === null) {
      return h(Paragraph, { text: "Waiting for the server's figures: they come every ten seconds.", foreground: Colour.Cyan });
    }
    return [
      h(Text, { key: "server", text: "The server", foreground: Colour.Yellow }),
      h(Table, { key: "server-figures", rows: wholeFigures(stats.server), labelCells: LABEL_CELLS }),
      h(Text, { key: "channel", text: "This channel", foreground: Colour.Yellow }),
      h(Table, { key: "channel-figures", rows: wholeFigures(stats.channel), labelCells: LABEL_CELLS }),
      h(BarChart, {
        key: "opened",
        bars: figuresIn(stats.channel, "most_opened")
          .slice(0, MOST_PAGES)
          .map(([page, count]) => ({ label: `Page ${page}`, value: count })),
        empty: "no pages opened yet",
        foreground: Colour.Green,
      }),
    ];
  }
}

export function behindPage(): PageSpec {
  return {
    page: PAGES.behind,
    title: "Behind the scenes",
    root: () =>
      frame({ look: LOOKS.services, title: "Behind the scenes", prompts: servicesPrompts(["Markets", PAGES.markets], ["About", PAGES.about]) }, h(Behind, {})),
  };
}
