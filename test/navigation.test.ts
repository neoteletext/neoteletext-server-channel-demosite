// A click on a page's link goes to the page.

import assert from "node:assert/strict";
import { test } from "node:test";

import { rowOf, text } from "neoteletext-server-ts-protocol/testing";
import { PAGES } from "../src/site/page-numbers.ts";
import { site } from "./site.ts";

test("a click on the index's Games link goes to the games' menu", () => {
  const { harness } = site();
  harness.join(1, PAGES.index);
  const { rows } = harness.seen(1, PAGES.index);
  const row = rowOf(rows, "Games");
  assert.ok(row !== undefined);
  harness.clickLeft(1, text(rows, row).indexOf("300"), row);
  assert.deepEqual(harness.gotos(1), [PAGES.games]);
});
