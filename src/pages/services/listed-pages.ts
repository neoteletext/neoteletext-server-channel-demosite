// The services' pages the menu lists, in its order.

import type { AreaPage } from "../../site/area.ts";
import { aboutPage } from "./about-page.ts";
import { behindPage } from "./behind-page.ts";
import { calendarPage } from "./calendar-page.ts";
import { clocksPage } from "./clocks-page.ts";
import { guidePage } from "./guide-page.ts";
import { longReadPage } from "./long-read-page.ts";
import { marketsPage } from "./markets-page.ts";
import { newsPage } from "./news-page.ts";
import { weatherPage } from "./weather-page.ts";

export function servicesPages(): AreaPage[] {
  return [
    { spec: newsPage(), about: "The headlines, a story to a page" },
    { spec: weatherPage(), about: "Six towns and the week ahead" },
    { spec: marketsPage(), about: "Prices that move as you watch" },
    { spec: guidePage(), about: "Tonight on four channels" },
    { spec: calendarPage(), about: "This month and what is on" },
    { spec: clocksPage(), about: "The world's time, and the new year" },
    { spec: longReadPage(), about: "The story of teletext" },
    { spec: behindPage(), about: "The server's own figures, live" },
    { spec: aboutPage(), about: "What this is, and the keys" },
  ];
}
