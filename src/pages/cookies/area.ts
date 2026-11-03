// Cookies: what a channel can keep in a viewer's cookies, on magazine 7, a
// page for each thing a cookie does, with the list of the viewer's own.

import { h } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { type Area, areaPrompts } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { CookieAttributes } from "./cookie-attributes.ts";
import { CookieList } from "./cookie-list.ts";
import { Lifetimes } from "./lifetimes.ts";
import { MinuteCookie } from "./minute-cookie.ts";
import { VisitCounter } from "./visit-counter.ts";

/** Each cookie page: its number, title, menu words and body. */
const COOKIE_PAGES = [
  { page: PAGES.visits, title: "Visit counter", about: "A count kept in a cookie", body: VisitCounter },
  { page: PAGES.lifetimes, title: "Session or kept", about: "A session cookie and a 30-day one", body: Lifetimes },
  { page: PAGES.minute, title: "Sixty seconds", about: "A cookie that lapses, counted down", body: MinuteCookie },
  { page: PAGES.cookieList, title: "Your cookies", about: "Every cookie you have here; remove any", body: CookieList },
  { page: PAGES.attributes, title: "Cookie attributes", about: "Path, max age, SameSite and the rest", body: CookieAttributes },
] as const;

export const COOKIE_AREA: Area = {
  name: "Cookies",
  about: "What a channel keeps in your cookies",
  look: LOOKS.cookies,
  menu: PAGES.cookies,
  pages: () =>
    COOKIE_PAGES.map(({ page, title, about, body }) => ({
      about,
      spec: {
        page,
        title,
        root: () => frame({ look: LOOKS.cookies, title, prompts: areaPrompts(["Cookies", PAGES.cookies], ["Your cookies", PAGES.cookieList]) }, h(body, {})),
      },
    })),
};
