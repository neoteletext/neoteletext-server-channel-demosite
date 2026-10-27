// The gallery lists the pictures, opens one at its three levels, and says
// so when it has none.

import assert from "node:assert/strict";
import { test } from "node:test";

import { Key } from "neottx-server-ts-protocol";
import { shows } from "neottx-server-ts-protocol/testing";
import { LEVELS } from "../src/pictures/picture.ts";
import { PAGES } from "../src/site/page-numbers.ts";
import { site } from "./site.ts";

test("the gallery lists the picture, and Enter opens it on 601 at its three levels with a sub-page about it", () => {
  const { harness } = site();
  harness.join(1, PAGES.gallery);
  assert.ok(shows(harness.seen(1, PAGES.gallery).rows, "Prairie dog"));
  harness.press(1, Key.Enter);
  assert.deepEqual(harness.gotos(1), [PAGES.picture]);
  harness.open(1, PAGES.picture);
  // A viewer's copy is published only while it differs from everyone's, which shows the first picture too.
  const subPages = harness.ownPages(1, PAGES.picture) ?? harness.sharedPages(PAGES.picture);
  assert.equal(subPages.length, LEVELS.length + 1);
  assert.ok(shows(subPages.at(-1)?.rows ?? [], "Prairie dog"));
  assert.deepEqual(harness.errors, []);
});

test("without pictures the gallery says it has none", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.gallery);
  assert.ok(shows(harness.seen(1, PAGES.gallery).rows, "No pictures"));
  harness.join(2, PAGES.picture);
  assert.ok(shows(harness.seen(2, PAGES.picture).rows, "No pictures"));
});
