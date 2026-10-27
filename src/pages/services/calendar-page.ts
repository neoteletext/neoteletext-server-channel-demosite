// Page 105, the calendar: this month, with what is on, and what is on the
// day a viewer chooses.

import { Colour } from "neottx-server-ts-protocol";
import { Calendar, type CalendarDate, type Child, Component, DATE_FORMATS, formatDate, Gap, h, type PageSpec, Paragraph } from "neottx-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { servicesPrompts } from "./prompts.ts";

/** What is on, by day of any month. */
const EVENTS: Readonly<Record<number, string>> = {
  3: "Book club, the library, 7pm",
  9: "Market day in the square",
  14: "Quiz night at the Red Lion",
  21: "Meteor shower: look north-east after midnight",
  27: "Repair cafe: bring what is broken",
};

interface CalendarViewState {
  readonly chosen: CalendarDate | null;
}

class CalendarView extends Component<object, CalendarViewState> {
  override state: CalendarViewState = { chosen: null };

  override render(): Child {
    // Unmounted, as when the runtime probes what the page needs, there is no clock yet.
    const today = new Date(this.mounted ? this.services.epochMs() : 0);
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    const marked = Object.keys(EVENTS).map((day) => ({ year, month, day: Number(day) }));
    const { chosen } = this.state;
    const said =
      chosen === null
        ? "Choose a day: the yellow ones have something on."
        : `${formatDate(Date.UTC(chosen.year, chosen.month, chosen.day), DATE_FORMATS.long)}: ${EVENTS[chosen.day] ?? "nothing on"}`;
    return [
      h(Calendar, {
        key: "calendar",
        year,
        month,
        today: today.getTime(),
        marked,
        selectable: true,
        onChoose: (date: CalendarDate) => {
          this.setState({ chosen: date });
        },
      }),
      h(Gap, { key: "gap" }),
      h(Paragraph, { key: "said", text: said, foreground: Colour.Cyan }),
    ];
  }
}

export function calendarPage(): PageSpec {
  return {
    page: PAGES.calendar,
    title: "Calendar",
    perViewer: true,
    root: () =>
      frame({ look: LOOKS.services, title: "What's on", prompts: servicesPrompts(["TV guide", PAGES.guide], ["Clocks", PAGES.clocks]) }, h(CalendarView, {})),
  };
}
