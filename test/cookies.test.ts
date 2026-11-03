// The cookie pages: a visit counter, a session cookie beside a persistent
// one, a cookie that lapses in sixty seconds, the list of the viewer's
// cookies with a way to remove each, and what each attribute does.

import assert from "node:assert/strict";
import { test } from "node:test";

import { Key } from "neoteletext-server-ts-protocol";
import type { Sent } from "neoteletext-server-ts-protocol/testing";
import { PAGES } from "../src/site/page-numbers.ts";
import { contentOf, runsText, site } from "./site.ts";

/** The cookies set for `connection`: name, value and max age, in order. */
function cookiesSet(sent: readonly Sent[], connection: number): [unknown, unknown, unknown][] {
  return sent
    .filter((message) => message["type"] === "cookie" && message["connection"] === connection)
    .map((message) => [message["name"], message["value"], message["max_age"]]);
}

const YEAR = 365 * 24 * 60 * 60;
const THIRTY_DAYS = 30 * 24 * 60 * 60;
const MINUTE_MS = 60_000;

test("the visit counter adds one to the visits cookie each time the page is opened, and keeps it a year", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.visits, [{ name: "visits", value: "4" }]);
  assert.match(runsText(contentOf(harness, 1, PAGES.visits)), /Visit number 5/u);
  harness.open(1, PAGES.cookies);
  harness.open(1, PAGES.visits);
  assert.match(runsText(contentOf(harness, 1, PAGES.visits)), /Visit number 6/u);
  assert.deepEqual(cookiesSet(harness.sent, 1), [
    ["visits", "5", YEAR],
    ["visits", "6", YEAR],
  ]);
});

test("a visits cookie that is not a number counts from none", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.visits, [{ name: "visits", value: "lots" }]);
  assert.match(runsText(contentOf(harness, 1, PAGES.visits)), /Visit number 1/u);
});

test("the session cookie has no max age and the persistent one thirty days", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.lifetimes);
  harness.press(1, Key.Enter);
  harness.press(1, Key.Tab);
  harness.press(1, Key.Enter);
  assert.deepEqual(
    cookiesSet(harness.sent, 1).map(([name, , maxAge]) => [name, maxAge]),
    [
      ["session_demo", null],
      ["kept_demo", THIRTY_DAYS],
    ],
  );
  assert.doesNotMatch(runsText(contentOf(harness, 1, PAGES.lifetimes)), /not set/u);
});

test("the sixty-second cookie counts down and says when it has lapsed", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.minute);
  harness.press(1, Key.Enter);
  const [set] = cookiesSet(harness.sent, 1);
  assert.deepEqual([set?.[0], set?.[2]], ["minute_demo", 60]);
  assert.match(runsText(contentOf(harness, 1, PAGES.minute)), /60 seconds left/u);
  harness.advance(MINUTE_MS / 2);
  assert.match(runsText(contentOf(harness, 1, PAGES.minute)), /30 seconds left/u);
  harness.advance(MINUTE_MS);
  assert.match(runsText(contentOf(harness, 1, PAGES.minute)), /Lapsed/u);
});

test("the cookie list shows the viewer's cookies, the language cookie included, and Enter removes one", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.cookieList, [
    { name: "visits", value: "3" },
    { name: "language", value: "ru" },
  ]);
  const listed = runsText(contentOf(harness, 1, PAGES.cookieList));
  assert.match(listed, /language=ru/u);
  assert.match(listed, /visits=3/u);
  // In order by name: language first.
  harness.press(1, Key.Enter);
  assert.deepEqual(cookiesSet(harness.sent, 1), [["language", "", 0]]);
  const after = runsText(contentOf(harness, 1, PAGES.cookieList));
  assert.doesNotMatch(after, /language=ru/u);
  assert.match(after, /English/u, "removing the language cookie puts the site back in English");
});

test("a cookie's value is shown as printable ASCII alone, whatever the viewer sent", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.cookieList, [{ name: "note", value: "a…b" }]);
  assert.match(runsText(contentOf(harness, 1, PAGES.cookieList)), /note=a\?b/u);
  assert.deepEqual(harness.errors, []);
});

test("the attributes page explains path, max age, SameSite, Secure, HttpOnly and the server's names", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.attributes);
  const seen = new Set<string>();
  for (let step = 0; step < 40; step += 1) {
    for (const line of runsText(contentOf(harness, 1, PAGES.attributes)).split("\n")) {
      seen.add(line);
    }
    harness.press(1, Key.Down);
  }
  for (const name of ["Path", "Max age", "SameSite", "Secure", "HttpOnly", "Names from _"]) {
    assert.ok(seen.has(name), name);
  }
});
