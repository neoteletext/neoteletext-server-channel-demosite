// One site in every language (REQ-2218): the page that chooses a language
// keeps it in the `language` cookie, every page is then drawn for the
// viewer with its samples in that language and its title naming it, and an
// address that names a language chooses it.

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
  const runs = runsSeen(harness, 1, PAGES.index);
  assert.ok(
    runs.some(([language, text]) => language === "en" && text === "NeoTeletext Demo - Russian"),
    JSON.stringify(runs),
  );
  assert.ok(runs.some(([language]) => language === "ru"));
  assert.deepEqual(harness.errors, []);
});

test("a page is drawn in the language of the viewer's cookie, and in English without one, one viewer's never another's", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.index, [{ name: "language", value: "ar" }]);
  harness.join(2, PAGES.index);
  const arabic = runsSeen(harness, 1, PAGES.index);
  const english = runsSeen(harness, 2, PAGES.index);
  assert.ok(
    arabic.some(([language, text]) => language === "ar" && text === "العربية"),
    "the heading is the language's name in itself",
  );
  assert.ok(arabic.some(([, text]) => text === "NeoTeletext Demo - Arabic"));
  assert.deepEqual(
    english.filter(([language]) => language !== "en"),
    [],
  );
  assert.ok(english.some(([, text]) => text === "NeoTeletext Demo - English"));
  assert.equal(contentOf(harness, 1, PAGES.index)?.language, "en", "the page is English, its samples in the viewer's language");
});

test("a cookie naming no language of the server's leaves the site in English", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.index, [{ name: "language", value: "xx" }]);
  assert.ok(runsSeen(harness, 1, PAGES.index).some(([, text]) => text === "NeoTeletext Demo - English"));
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

test("every page of the site is published without a fault in English, Russian, Greek, Arabic, Hebrew, Thai and Japanese kana", () => {
  for (const language of ["en", "ru", "el", "ar", "he", "th", "ja-Hrkt"]) {
    const { harness, specs } = site(false);
    harness.join(1, PAGES.index, [{ name: "language", value: language }]);
    for (const spec of specs) {
      harness.open(1, spec.page);
      assert.notEqual(contentOf(harness, 1, spec.page), undefined, `${language} ${spec.page.toString(16)}`);
    }
    assert.deepEqual(harness.errors, [], language);
  }
});
