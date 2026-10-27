// The games run on the clock, and a game's end puts its score in the hall
// of fame.

import assert from "node:assert/strict";
import { test } from "node:test";

import { Key } from "neottx-server-ts-protocol";
import { shows } from "neottx-server-ts-protocol/testing";
import { PAGES } from "../src/site/page-numbers.ts";
import { site } from "./site.ts";

/** Long enough for any of the games' frames to have run many times. */
const A_WHILE_MS = 5_000;

test("the cave flyer's score counts up as the clock runs, and it crashes with no one at the controls", () => {
  const { harness } = site();
  harness.join(1, PAGES.cave);
  harness.runUntil(harness.now + A_WHILE_MS);
  const { rows } = harness.seen(1, PAGES.cave);
  assert.ok(shows(rows, "over. Enter plays again"));
  assert.ok(!shows(rows, "Score 0:"));
  harness.join(2, PAGES.hall);
  assert.ok(shows(harness.seen(2, PAGES.hall).rows, "Cave flyer"));
  assert.ok(shows(harness.seen(2, PAGES.hall).rows, "Viewer 1"));
});

test("Enter plays the cave again once it is over", () => {
  const { harness } = site();
  harness.join(1, PAGES.cave);
  harness.runUntil(harness.now + A_WHILE_MS);
  harness.press(1, Key.Enter);
  assert.ok(shows(harness.seen(1, PAGES.cave).rows, "Score 0"));
  assert.ok(!shows(harness.seen(1, PAGES.cave).rows, "over"));
});

test("Invaders' shot, fired with Space, moves up the field as the clock runs", () => {
  const { harness } = site();
  harness.join(1, PAGES.invaders);
  const before = harness.seen(1, PAGES.invaders).rows;
  harness.press(1, " ");
  harness.runUntil(harness.now + A_WHILE_MS / 10);
  assert.notDeepEqual(harness.seen(1, PAGES.invaders).rows, before);
});
