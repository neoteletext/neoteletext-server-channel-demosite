// Page 103, the markets: prices that move every few seconds while anyone
// watches, each with its recent history.

import { Colour } from "neoteletext-server-ts-protocol";
import { type Child, Component, DataTable, h, type PageSpec, Sparkline } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { servicesPrompts } from "./prompts.ts";

const SHARES = [
  { name: "Mosaic Mining", price: 412 },
  { name: "Fastext Foods", price: 168 },
  { name: "Sixel Systems", price: 925 },
  { name: "Ceefax Cables", price: 77 },
  { name: "Oracle Oils", price: 530 },
  { name: "Header Homes", price: 241 },
] as const;
/** How often prices move. */
const MOVE_MS = 5_000;
/** The most a price moves at once, in pence either way. */
const MOST_MOVE = 6;
/** The history each sparkline shows. */
const HISTORY = 30;
/** The table's rows shown. */
const SHOWN = SHARES.length;
/** The shares with a sparkline under the table, as many as the page has room for. */
const SPARKLINES = 3;
const NAME_CELLS = 16;
const FIGURE_CELLS = 8;
const SPARK_LABEL_CELLS = 16;
/** Two rows: six levels of price. */
const SPARK_ROWS = 2;

interface MarketState {
  /** Each share's prices, oldest first. */
  readonly history: readonly (readonly number[])[];
}

class MarketBoard extends Component<object, MarketState> {
  override state: MarketState = { history: SHARES.map((share) => [share.price]) };

  override componentDidMount(): void {
    this.setInterval(
      () => {
        this.setState({
          history: this.state.history.map((prices) => {
            const last = prices.at(-1) ?? 1;
            const moved = Math.max(1, last + this.services.below(MOST_MOVE * 2 + 1) - MOST_MOVE);
            return [...prices, moved].slice(-HISTORY);
          }),
        });
      },
      MOVE_MS,
      { whileViewed: true },
    );
  }

  override render(): Child {
    const rows = SHARES.map((share, index) => {
      const prices = this.state.history[index] ?? [];
      const last = prices.at(-1) ?? share.price;
      const change = last - share.price;
      return [share.name, String(last), `${change >= 0 ? "+" : ""}${change}`];
    });
    return [
      h(DataTable, {
        key: "table",
        shared: true,
        shown: SHOWN,
        striped: true,
        columns: [
          { title: "Share", width: NAME_CELLS },
          { title: "Price", width: FIGURE_CELLS, align: "right" },
          { title: "Change", width: FIGURE_CELLS, align: "right", foreground: Colour.Yellow },
        ],
        rows,
      }),
      ...SHARES.slice(0, SPARKLINES).map((share, index) =>
        h(Sparkline, {
          key: share.name,
          label: share.name,
          labelCells: SPARK_LABEL_CELLS,
          values: this.state.history[index] ?? [],
          plotRows: SPARK_ROWS,
          last: true,
          foreground: Colour.Green,
        }),
      ),
    ];
  }
}

export function marketsPage(): PageSpec {
  return {
    page: PAGES.markets,
    title: "Markets",
    root: () =>
      frame(
        {
          look: LOOKS.services,
          title: "Markets",
          prompts: servicesPrompts(["News", PAGES.news], ["Behind", PAGES.behind]),
          hint: "Prices move every five seconds",
        },
        h(MarketBoard, {}),
      ),
  };
}
