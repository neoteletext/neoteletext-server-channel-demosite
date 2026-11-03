// One site in every language (REQ-2218, DEC-2232): the page that chooses a
// language keeps it in the `language` cookie, every page is then drawn in
// that language, the site's words as text of it (the library's stand-in,
// DEC-2233), and an address that names a language chooses it.

import assert from "node:assert/strict";
import { test } from "node:test";

import { ANY_SUB, Key } from "neoteletext-server-ts-protocol";
import { SERVER_LANGUAGES, type Sent } from "neoteletext-server-ts-protocol/testing";
import { PAGES } from "../src/site/page-numbers.ts";
import { contentOf, site } from "./site.ts";

/** The cookies set for `connection`, in order. */
function cookiesSet(sent: readonly Sent[], connection: number): Sent[] {
  return sent.filter((message) => message["type"] === "cookie" && message["connection"] === connection);
}

/** The Fastext row. */
const FASTEXT_ROW = 24;

/** Latin letters, which a page in a language whose sets lack them shows none of but on its Fastext row. */
const LATIN = /[A-Za-z]/u;

/** The runs of `page` as `session` sees it, each its language and text, but the Fastext row's, which stay the site's words (DEC-1987 item 6). */
function bodyRuns(harness: ReturnType<typeof site>["harness"], session: number, page: number): [string, string][] {
  return (contentOf(harness, session, page)?.text ?? []).filter((run) => run.row < FASTEXT_ROW).map((run) => [run.language ?? "", run.text]);
}

/** The runs of `page` as `session` sees it, each its language and text. */
function runsSeen(harness: ReturnType<typeof site>["harness"], session: number, page: number): [string, string][] {
  return (contentOf(harness, session, page)?.text ?? []).map((run) => [run.language ?? "", run.text]);
}

test("the picker sets the language cookie, for the whole channel and a year, and the index is then in that language", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.chooseLanguage);
  // English first, then the server's languages in its order.
  const place = SERVER_LANGUAGES.filter((language) => language.tag !== "en").findIndex((language) => language.tag === "ru") + 1;
  for (let step = 0; step < place; step += 1) {
    harness.press(1, Key.Down);
  }
  harness.press(1, Key.Enter);
  const [cookie] = cookiesSet(harness.sent, 1);
  assert.deepEqual(
    [cookie?.["name"], cookie?.["value"], cookie?.["path"], cookie?.["max_age"], cookie?.["same_site"]],
    ["language", "ru", "/", 365 * 24 * 60 * 60, "Lax"],
  );
  harness.open(1, PAGES.index);
  assert.equal(contentOf(harness, 1, PAGES.index)?.language, "ru");
  const runs = bodyRuns(harness, 1, PAGES.index);
  assert.ok(
    runs.some(([language, text]) => language === "ru" && /[а-яА-Я]/u.test(text)),
    JSON.stringify(runs),
  );
  assert.deepEqual(
    runs.filter(([, text]) => LATIN.test(text)),
    [],
    "every word of the page in Russian",
  );
  assert.deepEqual(harness.errors, []);
});

test("a page is drawn in the language of the viewer's cookie, and in English without one, one viewer's never another's", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.index, [{ name: "language", value: "ar" }]);
  harness.join(2, PAGES.index);
  assert.equal(contentOf(harness, 1, PAGES.index)?.language, "ar", "the page is in the viewer's language");
  const arabic = bodyRuns(harness, 1, PAGES.index);
  assert.ok(arabic.some(([language, text]) => language === "ar" && /[\u0600-\u06FF]/u.test(text)));
  assert.deepEqual(
    arabic.filter(([, text]) => LATIN.test(text)),
    [],
    "every word in Arabic",
  );
  assert.equal(contentOf(harness, 2, PAGES.index)?.language ?? "en", "en");
  assert.ok(runsSeen(harness, 2, PAGES.index).some(([, text]) => text === "NeoTeletext Demo"));
});

test("a cookie naming no language of the server's leaves the site in English", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.index, [{ name: "language", value: "xx" }]);
  assert.ok(runsSeen(harness, 1, PAGES.index).some(([, text]) => text === "NeoTeletext Demo"));
});

test("REQ-2218 item 3: the picker's address with ?language=el chooses Greek and goes to the index", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.about);
  harness.open(1, PAGES.chooseLanguage, ANY_SUB, "language=el");
  const [cookie] = cookiesSet(harness.sent, 1);
  assert.deepEqual([cookie?.["name"], cookie?.["value"]], ["language", "el"]);
  assert.equal(harness.redirects(1).at(-1), PAGES.index);
});

test("an address naming no language of the server's chooses none", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.about);
  harness.open(1, PAGES.chooseLanguage, ANY_SUB, "language=klingon");
  assert.deepEqual(cookiesSet(harness.sent, 1), []);
  assert.deepEqual(harness.redirects(1), []);
});

test("every page of the site is published without a fault in English, Russian, Greek, Arabic, Hebrew, Vietnamese and Japanese kana", () => {
  for (const language of ["en", "ru", "el", "ar", "he", "vi", "ja-Hrkt"]) {
    const { harness, specs } = site(false);
    harness.join(1, PAGES.index, [{ name: "language", value: language }]);
    for (const spec of specs) {
      harness.open(1, spec.page);
      assert.notEqual(contentOf(harness, 1, spec.page), undefined, `${language} ${spec.page.toString(16)}`);
    }
    assert.deepEqual(harness.errors, [], language);
  }
});
