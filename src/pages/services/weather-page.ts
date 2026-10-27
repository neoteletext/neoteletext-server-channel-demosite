// Page 102, the weather: today's for six towns, and the week's outlook.

import { Colour } from "neottx-server-ts-protocol";
import { BarChart, type Child, Columns, Component, h, Icon, type IconName, LineChart, type PageSpec, Rows, Text } from "neottx-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { servicesPrompts } from "./prompts.ts";

interface Town {
  readonly name: string;
  readonly sky: IconName;
  /** Degrees Celsius. */
  readonly high: number;
}

const TOWNS: readonly Town[] = [
  { name: "Aberdeen", sky: "rain", high: 9 },
  { name: "Belfast", sky: "cloud", high: 11 },
  { name: "Cardiff", sky: "sun", high: 14 },
  { name: "London", sky: "sun", high: 16 },
  { name: "Norwich", sky: "storm", high: 12 },
  { name: "Plymouth", sky: "snow", high: 2 },
];
/** Towns in a row. */
const TOWNS_ACROSS = 3;
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
/** The week's highs, degrees Celsius, and its rain, millimetres. */
const WEEK_HIGHS = [12, 14, 13, 9, 8, 11, 15] as const;
const WEEK_RAIN = [2, 0, 5, 12, 9, 3, 0] as const;
/** The line chart's plotted rows. */
const PLOT_ROWS = 4;
/** The bar chart's day labels. */
const DAY_CELLS = 5;
/** A town's cells: its icon and its name and high beside it. */
const ICON_CELLS = 4;

class TownWeather extends Component<{ readonly town: Town }> {
  override render(): Child {
    const { town } = this.props;
    return h(
      Columns,
      { widths: [ICON_CELLS, null], height: 2 },
      h(Icon, { name: town.sky }),
      h(Rows, {}, h(Text, { text: town.name }), h(Text, { text: `${town.high}C`, foreground: Colour.Yellow })),
    );
  }
}

export function weatherPage(): PageSpec {
  return {
    page: PAGES.weather,
    title: "Weather",
    root: () =>
      frame(
        { look: LOOKS.services, title: "Weather", prompts: servicesPrompts(["News", PAGES.news], ["Clocks", PAGES.clocks]) },
        ...[0, TOWNS_ACROSS].map((first) =>
          h(Columns, { key: first }, ...TOWNS.slice(first, first + TOWNS_ACROSS).map((town) => h(TownWeather, { key: town.name, town }))),
        ),
        h(Text, { text: "The week's highs, C", foreground: Colour.Cyan }),
        h(LineChart, { values: WEEK_HIGHS, plotRows: PLOT_ROWS, labels: WEEK, foreground: Colour.Yellow }),
        h(Text, { text: "Rain, mm", foreground: Colour.Cyan }),
        h(BarChart, { bars: WEEK.map((day, index) => ({ label: day, value: WEEK_RAIN[index] ?? 0 })), labelCells: DAY_CELLS, foreground: Colour.Blue }),
      ),
  };
}
