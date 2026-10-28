// Every page is published, to the channel or to a viewer who opens it,
// and nothing is reported.

import assert from "node:assert/strict";
import { test } from "node:test";

import { text } from "neoteletext-server-ts-protocol/testing";
import { PAGES } from "../src/site/page-numbers.ts";
import { site } from "./site.ts";

test("every page shows something to a viewer who opens it, and nothing is reported", () => {
  const { harness, specs } = site();
  specs.forEach((spec, place) => {
    const viewer = place + 1;
    harness.join(viewer, spec.page);
    const { rows } = harness.seen(viewer, spec.page);
    assert.ok(rows.length > 0, `page ${spec.page.toString(16)} published nothing`);
  });
  assert.deepEqual(harness.errors, []);
  assert.deepEqual(
    harness.sent.filter((message) => message["type"] === "log"),
    [],
  );
});

test("the index lists every area by its menu page", () => {
  const { harness } = site();
  harness.join(1, PAGES.index);
  const { rows } = harness.seen(1, PAGES.index);
  const shown = Array.from({ length: rows.length }, (_, row) => text(rows, row)).join("\n");
  // A link is its page number, the colour of its label, then the label.
  for (const link of [/110.Services/u, /200.Interactive/u, /300.Games/u, /400.Adventure/u, /500.Audio/u, /600.Gallery/u]) {
    assert.match(shown, link);
  }
});

test("each page number is used once", () => {
  const { specs } = site();
  const numbers = specs.map((spec) => spec.page);
  assert.deepEqual(numbers.length, new Set(numbers).size);
});
