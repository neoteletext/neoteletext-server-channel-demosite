// The pages of what the channel knows of the viewer (viewer-state.md VS-401
// to VS-409), on 701 to 705: whether it knows them, a visit or remembered, a
// count kept for them, forget me, and what it keeps. They replace the
// cookie pages, on the same numbers.

import assert from "node:assert/strict";
import { test } from "node:test";

import { Key } from "neoteletext-server-ts-protocol";
import { PAGES } from "../src/site/page-numbers.ts";
import { contentOf, runsText, site } from "./site.ts";

/** What `connection` is shown of `page`, as one text. */
function shown(harness: ReturnType<typeof site>["harness"], connection: number, page: number): string {
  return runsText(contentOf(harness, connection, page));
}

test("VS-401: the page says whether the channel knows the viewer, and never shows the handle", () => {
  const { harness } = site(false);
  const anonymous = harness.join(1, PAGES.known);
  assert.match(shown(harness, anonymous, PAGES.known), /Not known/u);
  const alice = harness.viewer("alice");
  const tab = harness.join(alice, PAGES.known);
  assert.match(shown(harness, tab, PAGES.known), /Known for this visit/u);
  assert.ok(!shown(harness, tab, PAGES.known).includes(alice.handle), "the handle is never shown (VS-409)");
  harness.remember(alice, true);
  const remembered = harness.join(alice, PAGES.known);
  assert.match(shown(harness, remembered, PAGES.known), /Remembered/u);
});

test("VS-407: a viewer not known asks to be known with the button, and the page says so once granted", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.known);
  harness.press(1, Key.Enter);
  assert.deepEqual(
    harness.sent.filter((message) => message["type"] === "request_state"),
    [{ type: "request_state", connection: 1 }],
  );
  harness.grantState(1);
  assert.match(shown(harness, 1, PAGES.known), /Known for this visit/u);
});

test("VS-208: a visit's viewer may ask to be remembered; the channel only asks the browser to offer it", () => {
  const { harness } = site(false);
  const tab = harness.join(harness.viewer("alice"), PAGES.remembered);
  assert.match(shown(harness, tab, PAGES.remembered), /Now: a visit/u);
  harness.press(tab, Key.Enter);
  assert.deepEqual(
    harness.sent.filter((message) => message["type"] === "offer_remember"),
    [{ type: "offer_remember", connection: tab }],
  );
});

test("VS-405: the visit counter is the viewer's: their other tab and their return go on from it, another viewer's starts at one", () => {
  const { harness } = site(false);
  const alice = harness.viewer("alice");
  const tab = harness.join(alice, PAGES.counter);
  assert.match(shown(harness, tab, PAGES.counter), /Visit number 1/u);
  harness.open(tab, PAGES.viewer);
  harness.open(tab, PAGES.counter);
  assert.match(shown(harness, tab, PAGES.counter), /Visit number 2/u);
  const other = harness.join(alice, PAGES.counter);
  assert.match(shown(harness, other, PAGES.counter), /Visit number 3/u, "her other tab");
  harness.restart();
  const bob = harness.join(harness.viewer("bob"), PAGES.counter);
  assert.equal(bob, tab, "bob has the number alice's tab had");
  assert.match(shown(harness, bob, PAGES.counter), /Visit number 1/u, "and none of her count");
});

test("VS-409: forget me ends the viewer's state and deletes what is kept for them", () => {
  const { harness } = site(false);
  const alice = harness.viewer("alice");
  const tab = harness.join(alice, PAGES.counter);
  harness.open(tab, PAGES.forget);
  assert.match(shown(harness, tab, PAGES.forget), /Forget me now/u);
  harness.press(tab, Key.Enter);
  assert.deepEqual(
    harness.sent.filter((message) => message["type"] === "end_state"),
    [{ type: "end_state", viewer: alice.handle }],
  );
  harness.open(tab, PAGES.counter);
  assert.match(shown(harness, tab, PAGES.counter), /Visit number 1/u, "her count is gone");
});

test("VS-702: the page of what is kept says what, for how long, and never what for", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.kept);
  const text = shown(harness, 1, PAGES.kept);
  assert.match(text, /A handle/u);
  assert.match(text, /24 hours/u);
  assert.deepEqual(harness.errors, []);
});
