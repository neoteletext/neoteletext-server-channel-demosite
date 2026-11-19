// Every page is pictured for a tab's thumbnail as a stranger sees it
// (neoteletext-common's docs/tab-thumbnails.md section 7.1; REQ-6901):
// the kit opens each page for no one on a connection of its own and
// answers with what it is shown, and nothing is reported. No page of this
// channel is marked never to be pictured.

import assert from "node:assert/strict";
import { test } from "node:test";

import type { Harness } from "neoteletext-server-ts-protocol/testing";
import { site } from "./site.ts";

/** The channel with its pictures, and its pages. */
function channel(): { harness: Harness; pages: number[] } {
  const { harness, specs } = site();
  return { harness, pages: specs.map((spec) => spec.page) };
}

test("DEC-6875: every page answers a snapshot with its page, and nothing is reported", () => {
  const { harness, pages } = channel();
  assert.ok(pages.length > 0);
  for (const page of pages) {
    const answer = harness.snapshot(page);
    assert.equal(answer["type"], "snapshot_page", `page ${page.toString(16)} is pictured`);
  }
  assert.deepEqual(harness.errors, []);
  assert.deepEqual(
    harness.sent.filter((message) => message["type"] === "log"),
    [],
  );
});
