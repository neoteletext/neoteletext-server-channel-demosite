// The files this channel and its sister share, word for word (DEC-2233
// item 4): the language pages' table, text and characters, the language
// page and the page that chooses a language, and the cookie pages' bodies.
// The two channels share no code but the released kits (DEC-1987 item 8),
// so each keeps a copy, and this test fails when the copies drift: change
// both together. It reads the sister's working tree beside this one, and
// fails, not passes, when it is not there.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

/** The sister channel's repository, beside this one in ~/devel. */
const SISTER = new URL("../../neoteletext-server-channel-uicomponentsdemo/", import.meta.url);
const HERE = new URL("../", import.meta.url);

/** The files both keep, from each repository's root. */
const SHARED = [
  "src/pages/cookies/cookie-attributes.ts",
  "src/pages/cookies/cookie-list.ts",
  "src/pages/cookies/cookie-names.ts",
  "src/pages/cookies/lifetimes.ts",
  "src/pages/cookies/minute-cookie.ts",
  "src/pages/cookies/visit-counter.ts",
  "src/pages/languages/character-tables.ts",
  "src/pages/languages/language-choice.ts",
  "src/pages/languages/language-files.ts",
  "src/pages/languages/language-page.ts",
  "src/pages/languages/language-sets.ts",
  "src/pages/languages/language-table.ts",
  "src/pages/languages/languages-african.ts",
  "src/pages/languages/languages-other.ts",
  "src/pages/languages/languages-standard.ts",
  "src/pages/languages/sample-text.ts",
] as const;

test("DEC-2233 item 4: the files shared with the sister channel are the same in both", () => {
  assert.ok(existsSync(SISTER), `the sister channel is not checked out at ${SISTER.pathname}: the shared files cannot be compared`);
  const drifted = SHARED.filter((path) => readFileSync(new URL(path, HERE), "utf8") !== readFileSync(new URL(path, SISTER), "utf8"));
  assert.deepEqual(drifted, [], "change these in both channels together");
});
