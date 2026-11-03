// The interactive pages answer: the calculator's keys, the poll's votes,
// the guestbook's signatures and the quiz's answers.

import assert from "node:assert/strict";
import { test } from "node:test";

import { Key } from "neoteletext-server-ts-protocol";
import { shows } from "neoteletext-server-ts-protocol/testing";
import { PAGES } from "../src/site/page-numbers.ts";
import { site } from "./site.ts";

test("the calculator's page shows the number and operator typed", () => {
  const { harness } = site();
  harness.join(1, PAGES.calculator);
  harness.typeKeys(1, "12+");
  assert.ok(shows(harness.seen(1, PAGES.calculator).rows, "12 +"));
});

test("a vote on the poll is seen by another viewer", () => {
  const { harness } = site();
  harness.join(1, PAGES.poll);
  harness.join(2, PAGES.poll);
  harness.press(1, Key.Enter);
  assert.ok(shows(harness.seen(2, PAGES.poll).rows, "1 vote"));
});

test("a message signed in the guestbook is seen by another viewer", () => {
  const { harness } = site();
  harness.join(1, PAGES.guestbook);
  harness.join(2, PAGES.guestbook);
  harness.typeText(1, "Hello from page 203");
  harness.press(1, Key.Enter);
  assert.ok(shows(harness.seen(2, PAGES.guestbook).rows, "Hello from page 203"));
  assert.ok(shows(harness.seen(2, PAGES.guestbook).rows, "Viewer 1"));
});

test("TODO-2466: what a viewer wrote in the guestbook is sent as text from outside, so a character English lacks is no refusal", () => {
  const { harness } = site();
  harness.join(1, PAGES.guestbook);
  harness.typeText(1, "Zoë was here");
  harness.press(1, Key.Enter);
  const sent = (harness.channel.copy(1, PAGES.guestbook) ?? harness.channel.copy("channel", PAGES.guestbook))?.at(-1);
  assert.ok(sent !== undefined, harness.errors.join("\n"));
  const message = (sent.content.text ?? []).filter((run) => run.text.includes("was here"));
  assert.ok(message.length > 0, JSON.stringify(sent.content.text));
  for (const run of message) {
    assert.equal(run.outside, true, JSON.stringify(run));
  }
  assert.deepEqual(harness.errors, [], "the kit, which checks every line it sends against the server's rules, refused nothing");
});

test("the quiz's right answer on a coloured key scores", () => {
  const { harness } = site();
  harness.join(1, PAGES.quiz);
  // The first question's answer is 40, the second: green.
  harness.press(1, Key.Green);
  assert.ok(shows(harness.seen(1, PAGES.quiz).rows, "score 1 of 1"));
});
