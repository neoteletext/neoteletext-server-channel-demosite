// One site in every language (REQ-2218, DEC-2232): the page that chooses a
// language keeps it for the viewer (viewer-state.md VS-408), every page is
// then drawn in that language, the site's words as text of it (the
// library's stand-in, DEC-2233), and an address that names a language
// chooses it.

import assert from "node:assert/strict";
import { test } from "node:test";

import { ANY_SUB, Key } from "neoteletext-server-ts-protocol";
import { SERVER_LANGUAGES } from "neoteletext-server-ts-protocol/testing";
import { PAGES } from "../src/site/page-numbers.ts";
import { contentOf, site } from "./site.ts";

/** A connection, `connection`, that chose `language` by the picker's address and is on the index. */
function inLanguage(harness: ReturnType<typeof site>["harness"], connection: number, language: string): void {
  harness.join(connection, PAGES.about);
  harness.open(connection, PAGES.chooseLanguage, ANY_SUB, `language=${language}`);
  harness.open(connection, PAGES.index);
}

/** The Fastext row. */
const FASTEXT_ROW = 24;

/** Latin letters, which a page in a language whose sets lack them shows none of but on its Fastext row. */
const LATIN = /[A-Za-z]/u;

/** The runs of `page` as `connection` sees it, each its language and text, but the Fastext row's, which stay the site's words (DEC-1987 item 6). */
function bodyRuns(harness: ReturnType<typeof site>["harness"], connection: number, page: number): [string, string][] {
  return (contentOf(harness, connection, page)?.text ?? []).filter((run) => run.row < FASTEXT_ROW).map((run) => [run.language ?? "", run.text]);
}

/** The runs of `page` as `connection` sees it, each its language and text. */
function runsSeen(harness: ReturnType<typeof site>["harness"], connection: number, page: number): [string, string][] {
  return (contentOf(harness, connection, page)?.text ?? []).map((run) => [run.language ?? "", run.text]);
}

test("the picker sets the viewer's language, and the index is then in that language", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.chooseLanguage);
  // English first, then the server's languages in its order.
  const place = SERVER_LANGUAGES.filter((language) => language.tag !== "en").findIndex((language) => language.tag === "ru") + 1;
  for (let step = 0; step < place; step += 1) {
    harness.press(1, Key.Down);
  }
  harness.press(1, Key.Enter);
  assert.equal(harness.sent.filter((message) => message["type"] === "cookie").length, 0, "no cookie: there is none (VS-408)");
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

test("a page is drawn in the viewer's language, and in English without one, one viewer's never another's", () => {
  const { harness } = site(false);
  inLanguage(harness, 1, "ar");
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

test("a language the server does not list leaves the site in English", () => {
  const { harness } = site(false);
  inLanguage(harness, 1, "xx");
  assert.ok(runsSeen(harness, 1, PAGES.index).some(([, text]) => text === "NeoTeletext Demo"));
});

test("REQ-2218 item 3: the picker's address with ?language=el chooses Greek and goes to the index", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.about);
  harness.open(1, PAGES.chooseLanguage, ANY_SUB, "language=el");
  assert.equal(harness.redirects(1).at(-1), PAGES.index);
  harness.open(1, PAGES.index);
  assert.equal(contentOf(harness, 1, PAGES.index)?.language, "el");
});

test("an address naming no language of the server's chooses none", () => {
  const { harness } = site(false);
  harness.join(1, PAGES.about);
  harness.open(1, PAGES.chooseLanguage, ANY_SUB, "language=klingon");
  assert.deepEqual(harness.redirects(1), []);
  harness.open(1, PAGES.index);
  assert.equal(contentOf(harness, 1, PAGES.index)?.language ?? "en", "en");
});

test("every page of the site is published without a fault in English, Russian, Greek, Arabic, Hebrew, Vietnamese and Japanese kana", () => {
  for (const language of ["en", "ru", "el", "ar", "he", "vi", "ja-Hrkt"]) {
    const { harness, specs } = site(false);
    inLanguage(harness, 1, language);
    for (const spec of specs) {
      harness.open(1, spec.page);
      assert.notEqual(contentOf(harness, 1, spec.page), undefined, `${language} ${spec.page.toString(16)}`);
    }
    assert.deepEqual(harness.errors, [], language);
  }
});
