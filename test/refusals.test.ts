// A sound the server refuses is written to its log with the path, the rule
// and the detail (typescript.md TS-25).

import assert from "node:assert/strict";
import { test } from "node:test";

import { fakeOpus, Harness } from "neoteletext-server-ts-protocol/testing";
import { ComponentChannel, IN_MEMORY, SqliteStateStore } from "neoteletext-server-ts-ui-components";
import { pages } from "../src/pages.ts";
import { REFUSALS } from "../src/refusals.ts";
import { makeSite } from "../src/site/site.ts";
import { PAGES } from "../src/site/page-numbers.ts";

test("TS-25: a refused sound is logged with its path, rule and detail", () => {
  const store = new SqliteStateStore(IN_MEMORY);
  const harness = new Harness([new ComponentChannel(pages(makeSite([], store)), { opus: fakeOpus(), ruleTables: "none", state: store }), REFUSALS]);
  harness.join(1, PAGES.drums);
  harness.press(1, "2");
  const [sound] = harness.sounds(1);
  assert.ok(sound !== undefined, "the drum sent a sound");
  harness.refuse(sound, "packets", "unknown_field", "a test's refusal");
  const logged = harness.sent.filter((message) => message["type"] === "log").map((message) => message["text"]);
  assert.deepEqual(logged.slice(-1), ["refused sound at packets: unknown_field: a test's refusal"]);
});
