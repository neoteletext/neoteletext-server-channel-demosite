// The language pages: every language the engine has a set for has its page,
// each page is in its language, a heading over a scrolling view of its
// text and letters (REQ-2155). The list here is written out rather than
// read from the table, so that a language dropped from the table fails too.

import assert from "node:assert/strict";
import { test } from "node:test";

import { decodeRow, Key, type LanguageTag } from "neoteletext-server-ts-protocol";
import { SET_DESIGNATIONS } from "../src/pages/languages/language-sets.ts";
import { LANGUAGES } from "../src/pages/languages/language-table.ts";
import { PAGES } from "../src/site/page-numbers.ts";
import { contentOf, runsText, site } from "./site.ts";

/** Each page, its language's English name and its tag. */
const EXPECTED: readonly (readonly [page: number, name: string, tag: LanguageTag])[] = [
  [0x802, "Akan", "ak"],
  [0x803, "Arabic", "ar"],
  [0x804, "Arabic T44", "ar"],
  [0x805, "Armenian", "hy"],
  [0x806, "Azerbaijani", "az"],
  [0x807, "Balochi", "bal"],
  [0x808, "Bambara", "bm"],
  [0x809, "Belarusian", "be"],
  [0x810, "Bulgarian", "bg"],
  [0x811, "Croatian", "hr"],
  [0x812, "Czech", "cs"],
  [0x813, "Dari", "prs"],
  [0x814, "Dinka", "din"],
  [0x815, "Dyula", "dyu"],
  [0x816, "English", "en"],
  [0x817, "Estonian", "et"],
  [0x818, "Ewe", "ee"],
  [0x819, "Finnish", "fi"],
  [0x820, "Fon", "fon"],
  [0x821, "French", "fr"],
  [0x822, "Fula", "ff"],
  [0x823, "Georgian", "ka"],
  [0x824, "German", "de"],
  [0x825, "Greek", "el"],
  [0x826, "Hausa", "ha"],
  [0x827, "Hebrew", "he"],
  [0x828, "Hungarian", "hu"],
  [0x829, "Igbo", "ig"],
  [0x830, "Indonesian", "id"],
  [0x831, "Italian", "it"],
  [0x832, "Japanese", "ja-Hrkt"],
  [0x833, "Japanese Romaji", "ja-Latn"],
  [0x834, "Kabyle", "kab"],
  [0x835, "Kanuri", "kr"],
  [0x836, "Katakana", "ja-Kana"],
  [0x837, "Kazakh", "kk"],
  [0x838, "Krio", "kri"],
  [0x839, "Kyrgyz", "ky"],
  [0x840, "Latvian", "lv"],
  [0x841, "Lingala", "ln"],
  [0x842, "Lithuanian", "lt"],
  [0x843, "Macedonian", "mk"],
  [0x844, "Mandinka", "mnk"],
  [0x845, "Mende", "men"],
  [0x846, "Mongolian", "mn"],
  [0x847, "Mossi", "mos"],
  [0x848, "Nuer", "nus"],
  [0x849, "Pashto", "ps"],
  [0x850, "Persian", "fa"],
  [0x851, "Polish", "pl"],
  [0x852, "Portuguese", "pt"],
  [0x853, "Romanian", "ro"],
  [0x854, "Russian", "ru"],
  [0x855, "Serbian", "sr"],
  [0x856, "Serbian Latin", "sr-Latn"],
  [0x857, "Serbian T38", "sr"],
  [0x858, "Sindhi", "sd"],
  [0x859, "Slovak", "sk"],
  [0x860, "Slovenian", "sl"],
  [0x861, "Sorani", "ckb"],
  [0x862, "Spanish", "es"],
  [0x863, "Swahili", "sw"],
  [0x864, "Swedish", "sv"],
  [0x865, "Tajik", "tg"],
  [0x866, "Tamazight", "tzm"],
  [0x867, "Tatar", "tt"],
  [0x868, "Tifinagh", "zgh"],
  [0x869, "Turkish", "tr"],
  [0x870, "Ukrainian", "uk"],
  [0x871, "Ukrainian T40", "uk"],
  [0x872, "Urdu", "ur"],
  [0x873, "Uyghur", "ug"],
  [0x874, "Vietnamese", "vi"],
];

/** The sets of write_text/sets.rs: the page writer's 48 names. */
const SET_COUNT = 48;
/** The row of the coloured keys' prompts. */
const FASTEXT_ROW = 24;
/** The first row under the title band, where the view starts. */
const VIEW_ROW = 3;
/** The indexes: whole pages, since a click is only ever found on a page's first sub-page. */
const INDEX_PAGES = [PAGES.languages, PAGES.moreLanguages] as const;
/** The Russian page, its headline and its letters. */
const RUSSIAN_PAGE = 0x854;
const RUSSIAN_HEADLINE = "Всеобщая декларация прав человека";
/** The pages whose text is Wikipedia's, each with the revision it came from: CC BY-SA 4.0 section 3(a)(1) asks for these on the page. */
const WIKIPEDIA_PAGES = [
  [0x834, "en.wikipedia.org/?oldid=1382739977"],
  [0x848, "en.wikipedia.org/?oldid=1362123989"],
  [0x861, "ckb.wikipedia.org/?oldid=1459364"],
] as const;
/** The credit, the changes and the licence, as the page shows them. */
const WIKIPEDIA_CREDIT = "Text: Wikipedia, changed. CC BY-SA 4.0";
const LICENCE_ADDRESS = "creativecommons.org/licenses/by-sa/4.0";
/** The languages no text of the Declaration was found for. */
const NO_DECLARATION = ["Mandinka"];

/** Every page of the channel. */
const PAGES_ON_THE_CHANNEL = site(false).specs.map((spec) => spec.page);

/** The names of the languages `found` picks. */
function without(found: (language: (typeof LANGUAGES)[number]) => boolean): string[] {
  return LANGUAGES.filter((language) => found(language)).map((language) => language.name);
}

/** A row's text as sent. */
function rowText(row: Parameters<typeof decodeRow>[0] | null): string {
  return row === null ? "" : String.fromCodePoint(...decodeRow(row));
}

test("every language has its page, under its name, in its language", () => {
  const { harness } = site(false);
  const found = EXPECTED.map(([page], place) => {
    harness.join(place + 1, page);
    return [page, harness.title(page), contentOf(harness, place + 1, page)?.language];
  });
  assert.deepEqual(found, EXPECTED);
  assert.deepEqual(harness.errors, []);
});

test("every one of the page writer's sets has a page", () => {
  assert.equal(Object.keys(SET_DESIGNATIONS).length, SET_COUNT);
  assert.deepEqual(
    [...new Set(LANGUAGES.map((language) => language.set))].toSorted((a, b) => a.localeCompare(b)),
    Object.keys(SET_DESIGNATIONS).toSorted((a, b) => a.localeCompare(b)),
  );
});

test("every language page shows row 24 and links back to the languages' index and the site's", () => {
  const { harness } = site(false);
  for (const [page] of EXPECTED) {
    harness.join(1, page);
    const content = contentOf(harness, 1, page);
    assert.equal(content?.display_row_24, true);
    assert.equal(content?.links[2]?.page, PAGES.languages.toString(16));
    assert.equal(content?.links[3]?.page, PAGES.index.toString(16));
    assert.notEqual(content?.rows[FASTEXT_ROW], null);
  }
});

test("the languages' indexes list every language with its page, and hold no sub-pages", () => {
  const { harness } = site(false);
  const shown = INDEX_PAGES.flatMap((index) => {
    harness.join(1, index);
    const copies = harness.channel.copy(1, index) ?? harness.channel.copy("channel", index) ?? [];
    assert.equal(copies.length, 1);
    return copies.flatMap(({ content }) => content.rows.map(rowText));
  }).join("\n");
  for (const [page, name] of EXPECTED) {
    assert.match(shown, new RegExp(String.raw`${page.toString(16)}.${name}`, "u"));
  }
});

test("a click on a language in the indexes goes to that language", () => {
  const { harness } = site(false);
  const clicked = EXPECTED.map(([page], place) => {
    const viewer = place + 1;
    const wanted = page.toString(16);
    for (const index of INDEX_PAGES) {
      harness.join(viewer, index);
      for (const { content } of harness.channel.copy(viewer, index) ?? harness.channel.copy("channel", index) ?? []) {
        const rows = content.rows.map(rowText);
        const row = rows.findIndex((text, number) => number > 0 && text.includes(wanted));
        if (row !== -1) {
          harness.clickLeft(viewer, rows[row]?.indexOf(wanted) ?? 0, row);
          return harness.redirects(viewer).at(-1);
        }
      }
    }
    return null;
  });
  assert.deepEqual(
    clicked,
    EXPECTED.map(([page]) => page),
  );
});

test("a page's text is the Declaration: a language without a text of it shows none, and none is written for it", () => {
  assert.deepEqual(
    without((language) => language.source === "none"),
    NO_DECLARATION,
  );
  assert.deepEqual(
    without((language) => language.text === ""),
    NO_DECLARATION,
  );
  assert.deepEqual(
    without((language) => language.source === "none" && language.headline !== ""),
    [],
  );
});

test("each page of Wikipedia's text credits it under the view, with its revision and licence, in English, and no other page does", () => {
  const { harness } = site(false);
  const credited = EXPECTED.flatMap(([page]) => {
    harness.join(1, page);
    // The credit stands under the view, so it is there wherever the view is.
    harness.press(1, Key.End);
    const runs = contentOf(harness, 1, page)?.text ?? [];
    const shown = runs.map((run) => run.text).join("\n");
    const article = WIKIPEDIA_PAGES.find(([wikipedia]) => wikipedia === page)?.[1];
    if (shown.includes(WIKIPEDIA_CREDIT) || shown.includes(LICENCE_ADDRESS) || shown.includes("wikipedia.org")) {
      assert.ok(shown.includes(WIKIPEDIA_CREDIT) && shown.includes(LICENCE_ADDRESS) && article !== undefined && shown.includes(article), page.toString(16));
      const credit = runs.find((run) => run.text === WIKIPEDIA_CREDIT);
      assert.equal(credit?.language, "en");
      return [page];
    }
    return [];
  });
  assert.deepEqual(
    credited,
    WIKIPEDIA_PAGES.map(([page]) => page),
  );
});

test("REQ-2155: a language page scrolls its text by the keys and the wheel, each viewer alone", () => {
  const { harness } = site(false);
  const firstRun = (viewer: number): string | undefined => contentOf(harness, viewer, RUSSIAN_PAGE)?.text?.find((run) => run.row === VIEW_ROW)?.text;
  harness.join(1, RUSSIAN_PAGE);
  harness.join(2, RUSSIAN_PAGE);
  assert.equal(firstRun(1), RUSSIAN_HEADLINE);
  harness.press(1, Key.Down);
  assert.notEqual(firstRun(1), RUSSIAN_HEADLINE, "Down moved viewer 1's view");
  assert.equal(firstRun(2), RUSSIAN_HEADLINE, "and not viewer 2's");
  harness.press(1, Key.Home);
  assert.equal(firstRun(1), RUSSIAN_HEADLINE);
  harness.press(1, Key.End);
  const letters = LANGUAGES.find((language) => language.name === "Russian")?.letters ?? "";
  assert.ok(runsText(contentOf(harness, 1, RUSSIAN_PAGE)).includes(letters.split(" ")[0] ?? "?"), "End shows the letters");
  harness.press(1, Key.Home);
  const NOTCH = 120;
  harness.wheel(2, NOTCH, 1, VIEW_ROW + 1);
  assert.notEqual(firstRun(2), RUSSIAN_HEADLINE, "the wheel moved viewer 2's view");
  assert.deepEqual(harness.errors, []);
});

test("magazine 8 holds the languages and nothing else: the index on 800 and 801, every language, and the page that chooses one", () => {
  const onMagazine = PAGES_ON_THE_CHANNEL.filter((page) => page >= PAGES.languages).toSorted((a, b) => a - b);
  assert.deepEqual(onMagazine, [PAGES.languages, PAGES.moreLanguages, ...EXPECTED.map(([page]) => page), PAGES.chooseLanguage]);
});
