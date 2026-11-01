// The language pages: every language the engine has a set for has its page,
// and each page designates its set. The list here is written out rather than
// read from the table, so that a language dropped from the table fails too.

import assert from "node:assert/strict";
import { test } from "node:test";

import { decodeRow } from "neoteletext-server-ts-protocol";
import { SET_DESIGNATIONS } from "../src/pages/languages/language-sets.ts";
import { LANGUAGES } from "../src/pages/languages/language-table.ts";
import { PAGES } from "../src/site/page-numbers.ts";
import { site } from "./site.ts";

/** Each page, its language and its set's designation, group and option. */
const EXPECTED: readonly (readonly [page: number, name: string, designation: number])[] = [
  [0x802, "Akan", 0b0101_001],
  [0x803, "Arabic", 0b1001_111],
  [0x804, "Armenian", 0b1011_001],
  [0x805, "Azerbaijani", 0b0101_100],
  [0x806, "Balochi", 0b1001_110],
  [0x807, "Bambara", 0b0101_001],
  [0x808, "Belarusian", 0b0111_001],
  [0x809, "Bulgarian", 0b0100_100],
  [0x810, "Croatian", 0b0011_101],
  [0x811, "Czech", 0b0000_110],
  [0x812, "Dari", 0b1001_000],
  [0x813, "Dinka", 0b0101_001],
  [0x814, "Dyula", 0b0101_001],
  [0x815, "English", 0b0000_000],
  [0x816, "Estonian", 0b0100_010],
  [0x817, "Ewe", 0b0101_010],
  [0x818, "Finnish", 0b0000_010],
  [0x819, "Fon", 0b0101_001],
  [0x820, "French", 0b0000_100],
  [0x821, "Fula", 0b0101_000],
  [0x822, "Georgian", 0b1011_000],
  [0x823, "German", 0b0000_001],
  [0x824, "Greek", 0b0110_111],
  [0x825, "Hausa", 0b0101_000],
  [0x826, "Hebrew", 0b1010_101],
  [0x827, "Hungarian", 0b0000_010],
  [0x828, "Igbo", 0b0101_110],
  [0x829, "Indonesian", 0b0000_000],
  [0x830, "Italian", 0b0000_011],
  [0x831, "Kabyle", 0b0101_011],
  [0x832, "Kanuri", 0b0101_101],
  [0x833, "Kazakh", 0b0010_110],
  [0x834, "Krio", 0b0101_001],
  [0x835, "Kyrgyz", 0b0111_101],
  [0x836, "Lao", 0b1100_100],
  [0x837, "Latvian", 0b0100_011],
  [0x838, "Lingala", 0b0101_001],
  [0x839, "Lithuanian", 0b0100_011],
  [0x840, "Macedonian", 0b0111_010],
  [0x841, "Mandinka", 0b0101_001],
  [0x842, "Mende", 0b0101_001],
  [0x843, "Mongolian", 0b0111_101],
  [0x844, "Mossi", 0b0101_101],
  [0x845, "Nuer", 0b0101_001],
  [0x846, "Pashto", 0b1001_010],
  [0x847, "Persian", 0b1001_000],
  [0x848, "Polish", 0b0001_000],
  [0x849, "Portuguese", 0b0000_101],
  [0x850, "Romanian", 0b0011_111],
  [0x851, "Russian", 0b0100_100],
  [0x852, "Serbian", 0b0111_011],
  [0x853, "Serbian Latin", 0b0011_101],
  [0x854, "Serbian T38", 0b0100_000],
  [0x855, "Sindhi", 0b1001_011],
  [0x856, "Slovak", 0b0000_110],
  [0x857, "Slovenian", 0b0011_101],
  [0x858, "Sorani", 0b1001_100],
  [0x859, "Spanish", 0b0000_101],
  [0x860, "Swahili", 0b0000_000],
  [0x861, "Swedish", 0b0000_010],
  [0x862, "Tajik", 0b0111_111],
  [0x863, "Tamazight", 0b0101_011],
  [0x864, "Tatar", 0b0111_110],
  [0x865, "Thai", 0b1100_010],
  [0x866, "Tifinagh", 0b1011_010],
  [0x867, "Turkish", 0b0010_110],
  [0x868, "Ukrainian", 0b0111_000],
  [0x869, "Ukrainian T40", 0b0100_101],
  [0x870, "Urdu", 0b1001_001],
  [0x871, "Uyghur", 0b1001_101],
  [0x872, "Vietnamese", 0b0101_111],
  [0x873, "Yoruba", 0b0101_110],
];

/** The sets of write_text/sets.rs: the page writer's 46 names. */
const SET_COUNT = 46;
/** A triplet's fields (EN 300 706 clause 12.3.1): address 6 bits, mode 5, data 7. */
const MODE_SHIFT = 6;
const DATA_SHIFT = 11;
/** Table 4, triplet 1: the default G0 and G2 designation, seven bits from bit 8. */
const DESIGNATION_SHIFT = 7;
const DESIGNATION_MASK = 0x7f;
const OPTION_MASK = 0b111;
/** The row of the coloured keys' prompts. */
const FASTEXT_ROW = 24;
/** The indexes: whole pages, since a click is only ever found on a page's first sub-page. */
const INDEX_PAGES = [PAGES.languages, PAGES.moreLanguages] as const;

/** Hebrew's page, whose set holds its letters at the small Latin letters' codes. */
const HEBREW_PAGE = 0x826;
/** The pages whose text is Wikipedia's, each with the revision it came from: CC BY-SA 4.0 section 3(a)(1) asks for these on the page. */
const WIKIPEDIA_PAGES = [
  [0x831, "en.wikipedia.org/?oldid=1382739977"],
  [0x845, "en.wikipedia.org/?oldid=1362123989"],
  [0x858, "ckb.wikipedia.org/?oldid=1459364"],
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

/** The page's own designation, from its packet X/28/0. */
function designationOf(harness: ReturnType<typeof site>["harness"], page: number): number | undefined {
  const [copy] = harness.channel.copy("channel", page) ?? [];
  const packet = copy?.content.packets.find((line) => line.packet === "x28" && line.designation === 0);
  const triplet = packet !== undefined && "triplets" in packet ? packet.triplets[0] : undefined;
  return triplet === undefined
    ? undefined
    : ((triplet.address | (triplet.mode << MODE_SHIFT) | (triplet.data << DATA_SHIFT)) >> DESIGNATION_SHIFT) & DESIGNATION_MASK;
}

test("every language has its page, under its name, designating its set", () => {
  const { harness } = site(false);
  const found = EXPECTED.map(([page], place) => {
    harness.join(place + 1, page);
    return [page, harness.title(page), designationOf(harness, page)];
  });
  assert.deepEqual(found, EXPECTED);
  assert.deepEqual(harness.errors, []);
});

test("a page's header bits agree with its designation", () => {
  const { harness } = site(false);
  for (const [page, , designation] of EXPECTED) {
    harness.join(1, page);
    const [copy] = harness.channel.copy("channel", page) ?? [];
    assert.equal(copy?.content.character_set.national_option, designation & OPTION_MASK);
  }
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
    const [copy] = harness.channel.copy("channel", page) ?? [];
    assert.equal(copy?.content.display_row_24, true);
    assert.equal(copy?.content.links[2]?.page, PAGES.languages.toString(16));
    assert.equal(copy?.content.links[3]?.page, PAGES.index.toString(16));
    assert.notEqual(copy?.content.rows[FASTEXT_ROW], null);
  }
});

test("the languages' indexes list every language with its page, and hold no sub-pages", () => {
  const { harness } = site(false);
  const shown = INDEX_PAGES.flatMap((index) => {
    harness.join(1, index);
    const copies = harness.channel.copy("channel", index) ?? [];
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
      for (const { content } of harness.channel.copy("channel", index) ?? []) {
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

test("the Hebrew page's index prompt is in the Latin capitals its set keeps", () => {
  const { harness } = site(false);
  harness.join(1, HEBREW_PAGE);
  const [copy] = harness.channel.copy("channel", HEBREW_PAGE) ?? [];
  assert.match(rowText(copy?.content.rows[FASTEXT_ROW] ?? null), /INDEX 800/u);
});

test("each page of Wikipedia's text credits it, with its revision and licence, and no other page does", () => {
  const { harness } = site(false);
  const credited = EXPECTED.flatMap(([page]) => {
    harness.join(1, page);
    const [copy] = harness.channel.copy("channel", page) ?? [];
    const shown = copy?.content.rows.map(rowText).join("\n") ?? "";
    const article = WIKIPEDIA_PAGES.find(([wikipedia]) => wikipedia === page)?.[1];
    if (shown.includes(WIKIPEDIA_CREDIT) || shown.includes(LICENCE_ADDRESS) || shown.includes("wikipedia.org")) {
      assert.ok(shown.includes(WIKIPEDIA_CREDIT) && shown.includes(LICENCE_ADDRESS) && article !== undefined && shown.includes(article), page.toString(16));
      return [page];
    }
    return [];
  });
  assert.deepEqual(
    credited,
    WIKIPEDIA_PAGES.map(([page]) => page),
  );
});

test("magazine 8 holds the languages and nothing else: the index on 800 and 801, then every language", () => {
  const onMagazine = PAGES_ON_THE_CHANNEL.filter((page) => page >= PAGES.languages).toSorted((a, b) => a - b);
  assert.deepEqual(onMagazine, [PAGES.languages, PAGES.moreLanguages, ...EXPECTED.map(([page]) => page)]);
});
