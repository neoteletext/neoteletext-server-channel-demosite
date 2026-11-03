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
  assert.deepEqual(harness.redirects(1), [PAGES.picture]);
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

/** The sub-code of the sub-page a page message carries. */
function subOf(message: Readonly<Record<string, unknown>> | undefined): string | undefined {
  const page = message?.["page"];
  return typeof page === "object" && page !== null && "sub" in page && typeof page.sub === "string" ? page.sub : undefined;
}

/** The entries of a sub-page list message: each sub-code and its title. */
function entriesOf(message: Readonly<Record<string, unknown>> | undefined): { readonly sub: string; readonly title: unknown }[] {
  const list: unknown = message?.["subpages"];
  if (!Array.isArray(list)) {
    return [];
  }
  return list.flatMap((entry: unknown) =>
    typeof entry === "object" && entry !== null && "sub" in entry && typeof entry.sub === "string"
      ? [{ sub: entry.sub, title: "title" in entry ? entry.title : undefined }]
      : [],
  );
}

test("TODO-1486: selecting page 602 answers with its first sub-page alone and a list naming every sub-page; a sub-code with that sub-page alone", () => {
  const [one] = loadPictures(PICTURES);
  assert.ok(one !== undefined);
  const many = Array.from({ length: 40 }, (_, index) => ({ ...one, name: `p${index}`, caption: `Picture ${index}` }));
  const { harness } = siteOf(many);
  harness.join(1, PAGES.index);
  let before = harness.sent.length;
  harness.open(1, PAGES.everyPicture);
  const answer = harness.sent.slice(before);
  const pages = answer.filter((message) => message["type"] === "page");
  assert.equal(pages.length, 1, "one sub-page answers a page selection");
  const lists = answer.filter((message) => message["type"] === "subpages");
  const entries = entriesOf(lists.at(-1));
  assert.equal(entries.length, many.length * LEVELS.length, "the list holds every sub-page");
  assert.equal(subOf(pages[0]), entries[0]?.sub, "the first in ascending order answers 3F7F");
  assert.ok(
    entries.every((entry) => typeof entry.title === "string" && entry.title.length > 0 && entry.title.length <= 40),
    "every sub-page is named in the list, in at most 40 characters",
  );
  const third = entries[2]?.sub;
  assert.ok(third !== undefined);
  before = harness.sent.length;
  harness.open(1, PAGES.everyPicture, Number.parseInt(third, 16));
  const stepped = harness.sent.slice(before).filter((message) => message["type"] === "page");
  assert.deepEqual(
    stepped.map((message) => subOf(message)),
    [third],
    "a sub-code is answered with that sub-page alone",
  );
  assert.deepEqual(harness.errors, []);
});
