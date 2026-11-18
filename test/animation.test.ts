// The animation pages (animation.md section 11; DEC-6524, DEC-6522): the
// channel's own pages beside the component library's. A viewer who opens
// one is sent its sprites and its own rule table in one frame; every line
// is one the server's schema accepts, every table is within the limits of
// page-rules.md RULE-57, and every sprite's frame names an object that
// the page's own packets X/26 define.

import assert from "node:assert/strict";
import { test } from "node:test";

import { checkProgram } from "neoteletext-server-ts-protocol";
import { Harness, type Sent, SERVER_LIMITS, text } from "neoteletext-server-ts-protocol/testing";

import type { AnimationPage } from "../src/pages/animation/animation-page.ts";
import { AnimationPages, animationPages } from "../src/pages/animation/animation-pages.ts";
import { PAGES } from "../src/site/page-numbers.ts";
import { site } from "./site.ts";

/** The connection of the tests' viewer. */
const VIEWER = 1;
const ALL = animationPages();

function pageOf(number: number): AnimationPage {
  const found = ALL.find((page) => page.page === number);
  if (found === undefined) {
    throw new RangeError(`no animation page ${number.toString(16)}`);
  }
  return found;
}

const FLASH_PAGE = pageOf(PAGES.flash);
const SPRITES_PAGE = pageOf(PAGES.sprites);
const CYCLING_PAGE = pageOf(PAGES.cycling);
const CONTROLS_PAGE = pageOf(PAGES.controls);

/** The modes of the triplets of the packet X/26 that begins the object a frame names. */
function modesOf(frame: number): number[] {
  return (CYCLING_PAGE.content.enhancements[frame >> 4]?.triplets ?? []).map((triplet) => triplet.mode);
}

/** The page a `page` message carries, as text. */
function rowsOf(message: Sent | undefined): string {
  return JSON.stringify(message?.["page"]);
}

// The limits of a rule table (page-rules.md RULE-57) and of a sub-page's sprites (animation.md ANIM-7).
const MAX_RULES = 64;
const MAX_ACTIONS = 16;
const MAX_SPRITES = 32;
const MAX_PACKETS = 16;
/** The rows a sprite may write: 1 to 23 (ANIM-8). */
const LAST_SPRITE_ROW = 23;
const COLUMNS = 40;
/** A rule's name (RULE-36). */
const NAME = /^[a-z][a-z0-9_]{0,31}$/u;
// EN 300 706 Tables 28 and 29: the definition of a Passive object, a Termination Marker, and NeoTeletext's control triplet.
const DEFINE_PASSIVE = 0x17;
const TERMINATION = 0x1f;
const CONTROL = 0x05;
const FLASH = 0x08;

function channel(): Harness {
  return new Harness([new AnimationPages()]);
}

/** What the channel writes for the viewer who selects `page`, but for the teletext page itself and the index that goes with it. */
function opening(harness: Harness, page: number): Sent[] {
  const before = harness.sent.length;
  harness.open(VIEWER, page);
  return harness.sent.slice(before).filter((message) => !["page", "subpages", "reply", "index"].includes(String(message["type"])));
}

function marks(sent: readonly Sent[]): unknown[] {
  return sent.map((message) => [message["type"], message["mark"] ?? null]);
}

/** A key as a rule of the page's table sends it. */
function keyBy(harness: Harness, rule: string, key: string): Sent[] {
  const before = harness.sent.length;
  harness.send(VIEWER, { kind: "key", action: "press", key, text: key, rule });
  return harness.sent.slice(before);
}

test("the index and the animation menu, the library's pages, link to the channel's own five", () => {
  const { harness } = site();
  harness.join(VIEWER, PAGES.index);
  const shown = (page: number): string => {
    const { rows } = harness.seen(VIEWER, page);
    return Array.from({ length: rows.length }, (_unused, row) => text(rows, row)).join("\n");
  };
  assert.match(shown(PAGES.index), /150.Animation/u);
  harness.open(VIEWER, PAGES.animation);
  const menu = shown(PAGES.animation);
  for (const link of [/151.Flash and ticks/u, /152.Sprites/u, /153.Frame cycling/u, /154.Controls/u, /155.Page swap/u]) {
    assert.match(menu, link);
  }
  assert.deepEqual(
    new AnimationPages().pages().map(({ page }) => page.toString(16)),
    ["151", "152", "153", "154", "155"],
  );
});

test("a viewer who opens a page is sent one frame, its sprites and its table; every line is valid and every table within its limits", () => {
  const harness = channel();
  harness.join(VIEWER, PAGES.flash);
  for (const page of ALL) {
    const number = page.page.toString(16);
    // From another page, so that every page is opened afresh.
    harness.open(VIEWER, page.page === PAGES.flash ? PAGES.sprites : PAGES.flash);
    const before = harness.sent.length;
    harness.open(VIEWER, page.page);
    const all = harness.sent.slice(before);
    for (const message of all) {
      assert.equal(checkProgram(message, SERVER_LIMITS), null, `${number}: a ${String(message["type"])} the schema accepts`);
    }
    const sent = all.filter((message) => ["frame", "sprites", "rules"].includes(String(message["type"])));
    assert.deepEqual(
      marks(sent),
      [
        ["frame", "begin"],
        ["sprites", null],
        ["rules", null],
        ["frame", "end"],
      ],
      number,
    );
    assert.deepEqual(sent[1]?.["sprites"], page.sprites);
    assert.deepEqual(sent[2]?.["table"], page.table);
    assert.ok(page.table.rules.length <= MAX_RULES);
    const names = page.table.rules.map((rule) => rule.name);
    assert.equal(new Set(names).size, names.length, `${number}: each rule's name is its own`);
    for (const rule of page.table.rules) {
      assert.match(rule.name, NAME);
      assert.ok(rule.do.length > 0 && rule.do.length <= MAX_ACTIONS, `${number}: ${rule.name}`);
    }
  }
  assert.deepEqual(harness.errors, []);
});

test("only the swap page has a rule that sends: the others send the channel nothing", () => {
  const sending = ALL.filter((page) => page.table.rules.some((rule) => rule.echo === true || rule.do.some((action) => action.action === "send")));
  assert.deepEqual(
    sending.map(({ page }) => page),
    [PAGES.swap],
  );
});

test("every sprite lies on the page's rows and its frames name Passive objects the page's own packets X/26 define", () => {
  for (const page of ALL) {
    const number = page.page.toString(16);
    const packets = page.content.enhancements;
    assert.ok(packets.length <= MAX_PACKETS && page.sprites.length <= MAX_SPRITES, number);
    assert.deepEqual(
      packets.map((packet) => packet.designation),
      packets.map((_packet, place) => place),
      `${number}: packets X/26 in the order of their designation codes`,
    );
    assert.ok(
      (packets[0]?.triplets ?? []).some((triplet) => triplet.mode === TERMINATION),
      `${number}: the page's own data is ended`,
    );
    assert.deepEqual(page.content.text ?? [], [], `${number}: no text for the server to encode into packets X/26`);
    for (const sprite of page.sprites) {
      const where = `${number}: sprite ${sprite.number}`;
      assert.ok(sprite.row >= 1 && sprite.row + sprite.height - 1 <= LAST_SPRITE_ROW && sprite.column >= 0 && sprite.column + sprite.width <= COLUMNS, where);
      for (const frame of sprite.frames) {
        assert.deepEqual([frame.source, frame.kind], ["local", "passive"], where);
        // A local object's number is its packet's designation code and its triplet (EN 300 706 Table 28).
        const definition = packets[frame.number >> 4]?.triplets[frame.number & 0xf];
        assert.equal(definition?.mode, DEFINE_PASSIVE, `${where}: object ${frame.number} is defined`);
        assert.equal(((definition.address & 0b11) << 7) | definition.data, frame.number, `${where}: the definition carries its own number`);
      }
    }
  }
});

test("the flash page has a flashing word and three counters whose frames are digits, cycled from the page's opening", () => {
  const row = FLASH_PAGE.content.rows.map((codes) => Buffer.from(codes ?? []).toString("latin1")).find((codes) => codes.includes("FLASHING"));
  assert.ok(row !== undefined && row.includes(`${String.fromCodePoint(FLASH)}FLASHING`), "the Flash attribute before the word");
  assert.deepEqual(
    FLASH_PAGE.sprites.map((sprite) => sprite.frames.length),
    [4, 10, 10],
  );
  assert.deepEqual(FLASH_PAGE.table.rules, [
    {
      name: "count",
      on: { event: "open" },
      do: [
        { action: "cycle", target: { object: 1 }, first: 0, last: 3, period: 19, once: false },
        { action: "cycle", target: { object: 2 }, first: 0, last: 9, period: 6, once: false },
        { action: "cycle", target: { object: 3 }, first: 0, last: 9, period: 60, once: false },
      ],
    },
  ]);
});

test("the sprites page moves its rocket a cell at a time, and the cycling page's frames are characters and mosaics", () => {
  assert.deepEqual(SPRITES_PAGE.table.rules[0], {
    name: "left",
    on: { event: "key", keys: [{ name: "ArrowLeft" }], repeat: true },
    do: [{ action: "move", target: { object: 10 }, x: -1, y: 0, relative: true }],
  });
  assert.deepEqual(
    CYCLING_PAGE.sprites.map((sprite) => [sprite.number, sprite.frames.length]),
    [
      [1, 5],
      [2, 5],
    ],
  );
  // G0 characters are column mode 01001 and G1 mosaics 00001 (Table 29): the first sprite's objects hold the one, the second's the other.
  assert.ok(modesOf(CYCLING_PAGE.sprites[0]?.frames[0]?.number ?? 0).includes(0x09));
  assert.ok(modesOf(CYCLING_PAGE.sprites[1]?.frames[1]?.number ?? 0).includes(0x01));
});

test("the controls page declares three controls, and its rules hide, show and force the looks of them by number", () => {
  const declared = (CONTROLS_PAGE.content.enhancements[0]?.triplets ?? []).filter((triplet) => triplet.mode === CONTROL);
  assert.deepEqual(
    declared.map((triplet) => [triplet.address, triplet.data]),
    [
      [3, 12],
      [3, 12],
      [3, 12],
    ],
  );
  const targets = CONTROLS_PAGE.table.rules.map((rule) => [
    rule.name,
    rule.do[0]?.action,
    rule.do[0] !== undefined && "target" in rule.do[0] ? rule.do[0].target : null,
  ]);
  assert.deepEqual(targets, [
    ["hide", "hide", { control: 2 }],
    ["show", "show", { control: 2 }],
    ["look_normal", "look", { control: 2 }],
    ["look_hover", "look", { control: 2 }],
    ["look_pressed", "look", { control: 2 }],
    ["alpha_down", "hide", { control: 3 }],
    ["alpha_up", "show", { control: 3 }],
  ]);
});

test("Space swaps the viewer's whole page and its sprite inside one frame, U with none, and another viewer keeps the first page", () => {
  const harness = channel();
  harness.join(VIEWER, PAGES.flash);
  assert.ok(opening(harness, PAGES.swap).length > 0);
  const framed = keyBy(harness, "framed", " ");
  assert.deepEqual(marks(framed), [
    ["frame", "begin"],
    ["page", null],
    ["sprites", null],
    ["frame", "end"],
  ]);
  for (const message of framed) {
    assert.equal(checkProgram(message, SERVER_LIMITS), null);
  }
  assert.deepEqual(framed[2]?.["sprites"], [
    {
      number: 1,
      shown: true,
      detectable: false,
      layer: 2,
      order: 0,
      column: 28,
      row: 15,
      width: 8,
      height: 1,
      frames: [{ source: "local", kind: "passive", number: 16 }],
    },
  ]);
  const unframed = keyBy(harness, "unframed", "u");
  assert.deepEqual(marks(unframed), [
    ["page", null],
    ["sprites", null],
  ]);
  assert.notEqual(rowsOf(unframed[0]), rowsOf(framed[1]), "the first page again");
  // The swap was this viewer's alone.
  const other = 2;
  harness.join(other, PAGES.swap);
  assert.deepEqual(harness.seen(other, PAGES.swap).rows, harness.seen(VIEWER, PAGES.swap).rows);
  keyBy(harness, "framed", " ");
  assert.notDeepEqual(harness.seen(other, PAGES.swap).rows, harness.seen(VIEWER, PAGES.swap).rows);
});
