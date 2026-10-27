// The time in large digits and in each of the world's cities, looked at
// again each second while anyone watches.

import { Colour } from "neottx-server-ts-protocol";
import { BigDigits, type Child, Component, h, Table, Text } from "neottx-server-ts-ui-components";

/** Cities and their hours from UTC, standard time. */
const CITIES = [
  ["London", 0],
  ["New York", -5],
  ["Tokyo", 9],
  ["Sydney", 10],
  ["Delhi", 5.5],
  ["Sao Paulo", -3],
] as const;
const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const LABEL_CELLS = 12;

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

function hoursAndMinutes(epochMs: number): string {
  const date = new Date(epochMs);
  return `${twoDigits(date.getUTCHours())}:${twoDigits(date.getUTCMinutes())}`;
}

interface WorldClockState {
  readonly now: number;
}

export class WorldClock extends Component<object, WorldClockState> {
  override state: WorldClockState = { now: 0 };

  override componentDidMount(): void {
    this.setState({ now: this.services.epochMs() });
    this.setInterval(
      () => {
        this.setState({ now: this.services.epochMs() });
      },
      SECOND_MS,
      { whileViewed: true },
    );
  }

  override render(): Child {
    const { now } = this.state;
    return [
      h(Text, { key: "utc", text: "UTC", foreground: Colour.Cyan }),
      h(BigDigits, { key: "digits", text: hoursAndMinutes(now), foreground: Colour.Yellow }),
      h(Table, { key: "cities", rows: CITIES.map(([city, hours]) => [city, hoursAndMinutes(now + hours * HOUR_MS)]), labelCells: LABEL_CELLS }),
    ];
  }
}
