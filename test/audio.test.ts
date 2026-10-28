// The instruments play to the viewer who plays them, and the radio streams.

import assert from "node:assert/strict";
import { test } from "node:test";

import { Key } from "neoteletext-server-ts-protocol";
import { shows } from "neoteletext-server-ts-protocol/testing";
import { PAGES } from "../src/site/page-numbers.ts";
import { site } from "./site.ts";

test("the piano's A key plays middle C to the viewer who pressed it, and says so", () => {
  const { harness } = site();
  harness.join(1, PAGES.piano);
  harness.typeKeys(1, "a");
  assert.ok(harness.sounds(1).length > 0);
  assert.ok(shows(harness.seen(1, PAGES.piano).rows, "Played C4"));
  assert.deepEqual(harness.errors, []);
});

test("a drum pad's digit plays its drum", () => {
  const { harness } = site();
  harness.join(1, PAGES.drums);
  harness.press(1, "2");
  assert.ok(shows(harness.seen(1, PAGES.drums).rows, "Hit: Snare"));
  assert.ok(harness.sounds(1).length > 0);
});

test("Enter on a radio tune streams it, and the player says what plays", () => {
  const { harness } = site();
  harness.join(1, PAGES.radio);
  harness.press(1, Key.Enter);
  harness.runUntil(harness.now + 2_000);
  // A live sound's blocks go to the viewer as the stream plays.
  assert.ok(harness.sounds(1).some((message) => "blocks" in message));
  assert.ok(shows(harness.seen(1, PAGES.radio).rows, "Playing: Test card"));
  assert.deepEqual(harness.errors, []);
});
