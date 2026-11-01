// The window on each language page: every code of the page's sets can be
// brought into view, and the keys move one viewer's window alone.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { decodeRow, Key } from "neoteletext-server-ts-protocol";
import { windowOf } from "../src/pages/languages/character-window.ts";
import { languageFile, languagePage } from "../src/pages/languages/language-files.ts";
import { SET_DESIGNATIONS } from "../src/pages/languages/language-sets.ts";
import { LANGUAGES } from "../src/pages/languages/language-table.ts";
import { site } from "./site.ts";

/** A code table's every position, 2/0 to 7/F. */
const ALL_CODES = Array.from({ length: 96 }, (_, place) => 0x20 + place);
/** The cells of a row of the window that hold its characters, and the cell of its colour. */
const CHARACTER_COLUMNS = Array.from({ length: 16 }, (_, place) => 2 + place * 2);
const COLOUR_COLUMN = 1;
/** The window's colours: white for the page's G0 set, green for the second G0 set ESC reaches. */
const FIRST_SET = 7;
const SECOND_SET = 2;
/** Table 28: Set Active Position; Table 29: a G2 character; Annex A.3: the Termination Marker. */
const ROW_ADDRESSES_FROM = 40;
const MODE_SET_ACTIVE_POSITION = 0b00100;
const MODE_G2 = 0b01111;
const TERMINATION_ADDRESS = 63;
const MODE_TERMINATION = 0b11111;
/** A designation's group, and the groups with a second G0 set of Latin English: the engine's default_second_g0, written out. */
const GROUP_SHIFT = 3;
const SECOND_LATIN = new Set([0b0101, 0b0111, 0b1001, 0b1011, 0b1100]);

type Harness = ReturnType<typeof site>["harness"];

/** The TTI file of the language at `place`, which has no window. */
function ttiOf(place: number): string {
  return readFileSync(languageFile(place), "latin1");
}

function ascending(codes: Iterable<number>): number[] {
  return [...codes].toSorted((a, b) => a - b);
}

/** What viewer 1 has of the page of the language at `place`: the window's rows and the local enhancement data. */
function windowShown(harness: Harness, place: number): { rows: number[][]; supplementary: number[]; addresses: number[]; ended: boolean } {
  const page = languagePage(place);
  const [copy] = harness.channel.copy(1, page) ?? harness.channel.copy("channel", page) ?? [];
  const { first, shown } = windowOf(ttiOf(place));
  const rows = Array.from({ length: shown }, (_, at) => {
    const row = copy?.content.rows[first + at] ?? null;
    return row === null ? [] : [...decodeRow(row)];
  });
  const triplets = (copy?.content.enhancements ?? []).flatMap((packet) => packet.triplets);
  const end = triplets.findIndex(({ address, mode }) => address === TERMINATION_ADDRESS && mode === MODE_TERMINATION);
  const data = end === -1 ? triplets : triplets.slice(0, end);
  return {
    rows,
    supplementary: data.filter(({ mode, address }) => mode === MODE_G2 && address < ROW_ADDRESSES_FROM).map(({ data: code }) => code),
    addresses: data.filter(({ address, mode }) => address >= ROW_ADDRESSES_FROM && mode === MODE_SET_ACTIVE_POSITION).map(({ address }) => address),
    ended: end !== -1,
  };
}

test("every language page's window reaches every code of its G0 set, of its second G0 set where it has one, and of G2", () => {
  const { harness } = site(false);
  LANGUAGES.forEach((language, place) => {
    harness.join(1, languagePage(place));
    const first = new Set<number>();
    const second = new Set<number>();
    const supplementary = new Set<number>();
    const seen: string[] = [];
    for (;;) {
      const view = windowShown(harness, place);
      assert.ok(view.ended, `${language.name}: the local enhancement data ends in a Termination Marker`);
      assert.deepEqual(view.addresses, ascending(view.addresses), `${language.name}: X/26 runs down the page`);
      const key = JSON.stringify(view);
      if (seen.includes(key)) {
        break;
      }
      seen.push(key);
      for (const code of view.supplementary) {
        supplementary.add(code);
      }
      for (const row of view.rows) {
        for (const column of CHARACTER_COLUMNS) {
          if (row[COLOUR_COLUMN] === FIRST_SET) {
            first.add(row[column] ?? 0);
          } else if (row[COLOUR_COLUMN] === SECOND_SET) {
            second.add(row[column] ?? 0);
          }
        }
      }
      harness.press(1, Key.Down);
    }
    const hasSecond = SECOND_LATIN.has(SET_DESIGNATIONS[language.set] >> GROUP_SHIFT);
    assert.deepEqual(ascending(first), ALL_CODES, `${language.name}: its G0 set`);
    assert.deepEqual(ascending(second), hasSecond ? ALL_CODES : [], `${language.name}: its second G0 set`);
    assert.deepEqual(ascending(supplementary), ALL_CODES, `${language.name}: its G2 set`);
  });
});

test("the keys move a viewer's window and no other's, and stop at its ends", () => {
  const { harness } = site(false);
  const page = languagePage(0);
  harness.join(1, page);
  harness.join(2, page);
  const shown = (): string => JSON.stringify(windowShown(harness, 0));
  const top = shown();
  harness.press(1, Key.Up);
  assert.equal(shown(), top, "Up stays on the first row");
  harness.press(1, Key.PageDown);
  assert.notEqual(shown(), top, "Page Down moves it");
  harness.press(1, Key.End);
  const end = shown();
  assert.notEqual(end, top, "End goes to the last row");
  harness.press(1, Key.Down);
  assert.equal(shown(), end, "and stays there");
  assert.notDeepEqual(harness.seen(1, page).rows, harness.seen(2, page).rows, "the other viewer's window has not moved");
  harness.press(1, Key.Home);
  assert.equal(shown(), top, "Home goes back");
});
