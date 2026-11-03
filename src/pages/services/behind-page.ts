// Page 108, behind the scenes: the server's own figures, which it sends
// every ten seconds, as they arrive.

import { type ChannelCounts, Colour, type ServerFigures, type ServerStats } from "neoteletext-server-ts-protocol";
import { BarChart, type Child, Component, h, type PageSpec, Paragraph, Table, Text } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { servicesPrompts } from "./prompts.ts";

/** The pages charted, and the cells of a figure's name. */
const MOST_PAGES = 5;
const LABEL_CELLS = 22;

/** The server's figures shown, as a table's rows: memory only where its system says. */
function serverRows(server: ServerFigures): [string, string][] {
  const rows: [string, string][] = [
    ["uptime s", String(server.uptime_s)],
    ["connections", String(server.connections)],
    ["connections total", String(server.connections_total)],
    ["messages sent", String(server.messages_sent)],
    ["bytes sent", String(server.bytes_sent)],
  ];
  return server.memory_kb === null || server.memory_kb === undefined ? rows : [...rows, ["memory kB", String(server.memory_kb)]];
}

/** This channel's figures shown, as a table's rows. */
function channelRows(channel: ChannelCounts): [string, string][] {
  return [
    ["viewers", String(channel.viewers)],
    ["viewers total", String(channel.viewers_total)],
    ["pages opened", String(channel.opens)],
    ["inputs", String(channel.inputs)],
    ["sub-pages sent", String(channel.pages_sent)],
    ["refused", String(channel.refused)],
  ];
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
      h(Table, { key: "server-figures", rows: serverRows(stats.server), labelCells: LABEL_CELLS }),
      h(Text, { key: "channel", text: "This channel", foreground: Colour.Yellow }),
      h(Table, { key: "channel-figures", rows: channelRows(stats.channel), labelCells: LABEL_CELLS }),
      h(BarChart, {
        key: "opened",
        bars: stats.channel.most_opened.slice(0, MOST_PAGES).map(({ page, opens }) => ({ label: `Page ${page}`, value: opens })),
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
