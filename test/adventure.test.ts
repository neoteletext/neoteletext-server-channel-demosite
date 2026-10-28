// An adventure played through to its end by typed commands.

import assert from "node:assert/strict";
import { test } from "node:test";

import { Key } from "neoteletext-server-ts-protocol";
import { shows } from "neoteletext-server-ts-protocol/testing";
import { PAGES } from "../src/site/page-numbers.ts";
import { site } from "./site.ts";

test("the Station is won by taking the keycard to the escape pod", () => {
  const { harness } = site();
  harness.join(1, PAGES.station);
  const command = (typed: string): void => {
    harness.typeText(1, typed);
    harness.press(1, Key.Enter);
  };
  command("n");
  command("go down");
  assert.ok(shows(harness.seen(1, PAGES.station).rows, "can't go that way"));
  command("up");
  command("east");
  assert.ok(shows(harness.seen(1, PAGES.station).rows, "needs a keycard"));
  command("d");
  command("w");
  command("take keycard");
  assert.ok(shows(harness.seen(1, PAGES.station).rows, "Carrying: keycard"));
  command("e");
  command("u");
  command("e");
  assert.ok(shows(harness.seen(1, PAGES.station).rows, "The end"));
});
