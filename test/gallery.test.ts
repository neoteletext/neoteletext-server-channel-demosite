// The gallery lists the pictures, opens one at its three levels, and says
// so when it has none.

import assert from "node:assert/strict";
import { test } from "node:test";

import { Key } from "neoteletext-server-ts-protocol";
import { shows } from "neoteletext-server-ts-protocol/testing";
import { loadPictures } from "../src/pictures/load-pictures.ts";
import { LEVELS } from "../src/pictures/picture.ts";
import { PAGES } from "../src/site/page-numbers.ts";
import { PICTURES, site, siteOf } from "./site.ts";

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

test("page 602 holds every picture at every level, a sub-page each, past the 64 a page once held, and the gallery links to it", () => {
  const [one] = loadPictures(PICTURES);
  assert.ok(one !== undefined);
  const many = Array.from({ length: 40 }, (_, index) => ({ ...one, name: `p${index}`, caption: `Picture ${index}` }));
  const { harness } = siteOf(many);
  harness.join(1, PAGES.everyPicture);
  const subPages = harness.sharedPages(PAGES.everyPicture);
  assert.equal(subPages.length, many.length * LEVELS.length, "every level of every picture");
  assert.ok(subPages.length > 64);
  assert.ok(shows(subPages[0]?.rows ?? [], "Level 1.5"), "titled with its level");
  assert.ok(shows(subPages.at(-1)?.rows ?? [], "Level 3.5"));
  harness.join(2, PAGES.gallery);
  assert.equal(harness.seen(2, PAGES.gallery).links[3], PAGES.everyPicture, "the gallery's cyan key");
  assert.deepEqual(harness.errors, []);
});
