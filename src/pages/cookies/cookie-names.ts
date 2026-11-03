// The cookies the cookie pages set, and what every one of them is set with
// unless it says otherwise: the whole channel's path, and SameSite Lax, as
// the library's language cookie is.

import type { CookieOptions } from "neoteletext-server-ts-protocol";

export const COOKIES = {
  /** How many times the viewer has opened the visit counter. */
  visits: "visits",
  /** Lasts the browser's session: no max age. */
  session: "session_demo",
  /** Lasts thirty days. */
  persistent: "kept_demo",
  /** Lasts sixty seconds: its value is when it lapses, in milliseconds since the Unix epoch. */
  minute: "minute_demo",
} as const;

/** A day, in seconds. */
const DAY_SECONDS = 24 * 60 * 60;
/** A year, as the visit count is kept: in seconds. */
export const YEAR_SECONDS = 365 * DAY_SECONDS;
/** Thirty days, as the persistent cookie is kept: in seconds. */
export const THIRTY_DAYS_SECONDS = 30 * DAY_SECONDS;
/** The short cookie's life, in seconds. */
export const MINUTE_SECONDS = 60;
export const MS_A_SECOND = 1000;

/** What every cookie here is set with. */
export const SITE_WIDE: CookieOptions = { path: "/", sameSite: "Lax" };

/** The longest number a cookie's value is read as: a count or a time, digits only. A value is the viewer's, untrusted. */
const NUMBER = /^\d{1,15}$/u;

/** A cookie's value read as a whole number, or null when it is not one. */
export function numberIn(value: string | undefined): number | null {
  return value !== undefined && NUMBER.test(value) ? Number(value) : null;
}

/** A character a page can show in English: printable ASCII. */
const NOT_SHOWABLE = /[^ -~]/gu;

/** A cookie's name or value as the page shows it: the viewer's text, untrusted, so anything but printable ASCII is shown as `?`, which every page can show. */
export function shown(text: string): string {
  return text.replaceAll(NOT_SHOWABLE, "?");
}

/** A time of day, UTC, as HH:MM:SS. */
export function clockOf(epochMs: number): string {
  const TIME_FROM = 11;
  const TIME_TO = 19;
  return new Date(epochMs).toISOString().slice(TIME_FROM, TIME_TO);
}
