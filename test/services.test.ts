// The live services change as the clock runs and the server's figures arrive.

import assert from "node:assert/strict";
import { test } from "node:test";

import { serverStats, shows } from "neoteletext-server-ts-protocol/testing";
import { PAGES } from "../src/site/page-numbers.ts";
import { site } from "./site.ts";

test("the markets' prices move while someone watches", () => {
  const { harness } = site();
  harness.join(1, PAGES.markets);
  const before = harness.seen(1, PAGES.markets).rows;
  harness.runUntil(harness.now + 30_000);
  assert.notDeepEqual(harness.seen(1, PAGES.markets).rows, before);
});

test("behind the scenes shows the server's figures when they arrive", () => {
  const { harness } = site();
  harness.join(1, PAGES.behind);
  assert.ok(shows(harness.seen(1, PAGES.behind).rows, "Waiting for the server's figures"));
  harness.stats(serverStats({ server: { connections: 3, memory_kb: null }, channel: { viewers: 3, most_opened: [{ page: "100", opens: 5 }] } }));
  const { rows } = harness.seen(1, PAGES.behind);
  assert.ok(shows(rows, "viewers"));
  assert.ok(shows(rows, "Page 100"));
  assert.ok(!shows(rows, "memory"), "no memory where the server's system says none");
});

test("a news story's page has the story's headline", () => {
  const { harness } = site();
  harness.join(1, PAGES.firstStory);
  assert.ok(shows(harness.seen(1, PAGES.firstStory).rows, "Teletext returns"));
});
