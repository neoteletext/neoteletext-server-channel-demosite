// What the site keeps outlasts the program (REQ-1057): the guestbook, the
// hall of fame, the poll's votes and each viewer's ballot are there when
// the channel starts again on the same database file, as a program the
// server starts again opens it. A ballot is kept under the viewer's handle
// (viewer-state.md VS-405), never a connection's number (TODO-6463).

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { Key } from "neoteletext-server-ts-protocol";
import { shows } from "neoteletext-server-ts-protocol/testing";
import { SqliteStateStore } from "neoteletext-server-ts-ui-components";
import { PAGES } from "../src/site/page-numbers.ts";
import { siteOf } from "./site.ts";

/** Long enough for the cave flyer to crash with no one at the controls, so that its score is posted. */
const A_WHILE_MS = 5_000;

test("REQ-1057: the guestbook, the hall of fame and the poll are there after the channel starts again", () => {
  const root = join(import.meta.dirname, "..", "tmp");
  mkdirSync(root, { recursive: true });
  const folder = mkdtempSync(join(root, "kept-"));
  try {
    const path = join(folder, "state.sqlite");
    const before = new SqliteStateStore(path);
    const first = siteOf([], before).harness;
    const tab = first.join(first.viewer("alice"), PAGES.guestbook);
    first.typeText(tab, "Kept across a restart");
    first.press(tab, Key.Enter);
    first.open(tab, PAGES.poll);
    first.press(tab, Key.Enter);
    first.open(tab, PAGES.cave);
    first.runUntil(first.now + A_WHILE_MS);
    before.close();

    const after = new SqliteStateStore(path);
    const second = siteOf([], after).harness;
    const bob = second.join(second.viewer("bob"), PAGES.guestbook);
    assert.equal(bob, tab, "the server gave bob the number alice's tab had");
    assert.ok(shows(second.seen(bob, PAGES.guestbook).rows, "Kept across a restart"), "the guestbook's entry");
    second.open(bob, PAGES.hall);
    assert.ok(shows(second.seen(bob, PAGES.hall).rows, "Cave flyer"), "the hall of fame's score");
    second.open(bob, PAGES.poll);
    assert.ok(shows(second.seen(bob, PAGES.poll).rows, "1 votes"), "the poll's vote");
    assert.ok(!shows(second.seen(bob, PAGES.poll).rows, "* is yours"), "bob is not given alice's ballot");
    const alice = second.join(second.viewer("alice"), PAGES.poll);
    assert.ok(shows(second.seen(alice, PAGES.poll).rows, "* is yours"), "the viewer's own ballot");
    assert.deepEqual(second.errors, []);
    after.close();
  } finally {
    rmSync(folder, { recursive: true });
  }
});
