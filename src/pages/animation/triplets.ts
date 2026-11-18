// The enhancement triplets of packets X/26 the animation pages write
// themselves (EN 300 706 clause 12.3, Tables 28 and 29): the definitions
// of the objects their sprites draw, and NeoTeletext's control triplet.
// A sprite's frame names an object of the page's own packets by the number
// of an Object Invocation triplet (animation.md ANIM-7).

import type { Colour } from "neoteletext-server-ts-protocol";
import type { Enhancement, SpriteFrame, Triplet } from "neoteletext-server-ts-protocol/protocol";

/** Triplets in a packet X/26 (clause 12.3.1). */
const TRIPLETS_PER_PACKET = 13;
/** Packets X/26 a page may have: designation codes 0 to 15. */
const MOST_PACKETS = 16;
/** A row address triplet's address is 40 and the row, 1 to 23 (Table 28). */
const ROW_ADDRESS = 40;
// Row address modes (Table 28).
const SET_ACTIVE_POSITION = 0x04;
/** Object definition of a Passive object: 10111. */
const DEFINE_PASSIVE = 0x17;
const TERMINATION = 0x1f;
/** The address of a Termination Marker: 63. */
const TERMINATION_ADDRESS = 63;
/** The address of an Object Definition: bit 5 set, then bits 4 and 3 that say the levels it is for, both 2.5 and 3.5 here. */
const DEFINITION_ADDRESS = 0b111000;
// Column address modes (Table 29).
const FOREGROUND = 0x00;
const MOSAIC_G1 = 0x01;
const BACKGROUND = 0x03;
/** NeoTeletext's control triplet: a mode Table 29 reserves, which every other decoder passes over (the engine's decision E.127). */
const CONTROL = 0x05;
const G0_CHARACTER = 0x09;
/** A Termination Marker's data: the end of an object's definition, with more packets to follow; and the end of everything. */
const END_OF_OBJECT = 0b101;
const END_OF_ALL = 0b111;
/** What fills a packet after its last triplet: a reserved row mode at row 1, which every decoder passes over (Annex A.5, note 1). */
const FILLER: Triplet = { address: 41, mode: 0x02, data: 0 };
/** A local object's number: the designation code of the packet that begins its definition in bits 7 to 4, and the triplet in it, the first, in bits 3 to 0 (Table 28). */
const DESIGNATION_SHIFT = 4;
/** The bits of an object's number its definition's data carries: N6 to N0; N8 and N7 are in its address. */
const NUMBER_DATA_BITS = 7;
const NUMBER_DATA_MASK = 0x7f;

/** The cells of one row of an object, from the object's origin: its colours, then its characters. */
export interface ObjectRow {
  readonly foreground: Colour;
  readonly background: Colour;
  /** Each cell: a character of the primary set, or a mosaic's code. */
  readonly cells: readonly { readonly mosaic: boolean; readonly code: number }[];
}

/** A row of an object, in characters of ASCII that the page's set shows as written. */
export function lettered(foreground: Colour, background: Colour, text: string): ObjectRow {
  return { foreground, background, cells: Array.from(Buffer.from(text, "ascii"), (code) => ({ mosaic: false, code })) };
}

/** A row of an object, in mosaics. */
export function mosaics(foreground: Colour, background: Colour, codes: readonly number[]): ObjectRow {
  return { foreground, background, cells: codes.map((code) => ({ mosaic: true, code })) };
}

/** The triplets that draw `rows`, the first at the object's origin and each next a row lower. */
function body(rows: readonly ObjectRow[]): Triplet[] {
  return rows.flatMap(({ foreground, background, cells }, row) => [
    // Within an object a row address is counted from the object's origin.
    ...(row === 0 ? [] : [{ address: ROW_ADDRESS + row, mode: SET_ACTIVE_POSITION, data: 0 }]),
    { address: 0, mode: FOREGROUND, data: foreground },
    { address: 0, mode: BACKGROUND, data: background },
    ...cells.map(({ mosaic, code }, column) => ({ address: column, mode: mosaic ? MOSAIC_G1 : G0_CHARACTER, data: code })),
  ]);
}

/** A control on `row`: `width` cells from `column`, which a receiver that takes a pointer answers itself (the engine's REQ-INT-117). */
export function control(row: number, column: number, width: number): Triplet[] {
  return [
    { address: ROW_ADDRESS + row, mode: SET_ACTIVE_POSITION, data: 0 },
    { address: column, mode: CONTROL, data: width },
  ];
}

function packet(designation: number, triplets: readonly Triplet[]): Enhancement {
  const filled = [...triplets, ...Array.from({ length: TRIPLETS_PER_PACKET - triplets.length }, () => FILLER)];
  const [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12] = filled;
  if (
    t0 === undefined ||
    t1 === undefined ||
    t2 === undefined ||
    t3 === undefined ||
    t4 === undefined ||
    t5 === undefined ||
    t6 === undefined ||
    t7 === undefined ||
    t8 === undefined ||
    t9 === undefined ||
    t10 === undefined ||
    t11 === undefined ||
    t12 === undefined ||
    filled.length !== TRIPLETS_PER_PACKET
  ) {
    throw new RangeError("a packet X/26 holds thirteen triplets");
  }
  return { designation, triplets: [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12] };
}

/** A page's packets X/26, and the frame that names each of its objects. */
export interface Enhanced {
  readonly enhancements: Enhancement[];
  /** The objects' frames, in the order the objects were given. */
  readonly frames: SpriteFrame[];
}

/**
 * A page's packets X/26: its own enhancement data in the first, then each
 * Passive object's definition beginning a packet of its own, so that its
 * number is that packet's designation code and triplet 0. A page that
 * would need more packets than a page has stops the program when it starts.
 */
export function enhanced(local: readonly Triplet[], objects: readonly (readonly ObjectRow[])[]): Enhanced {
  const first = [...local, { address: TERMINATION_ADDRESS, mode: TERMINATION, data: END_OF_ALL }];
  if (first.length > TRIPLETS_PER_PACKET) {
    throw new RangeError("the page's own enhancement data does not fit packet X/26/0");
  }
  const enhancements = [packet(0, first)];
  const frames: SpriteFrame[] = [];
  for (const rows of objects) {
    const number = enhancements.length << DESIGNATION_SHIFT;
    const definition = { address: DEFINITION_ADDRESS | (number >> NUMBER_DATA_BITS), mode: DEFINE_PASSIVE, data: number & NUMBER_DATA_MASK };
    const triplets = [definition, ...body(rows), { address: TERMINATION_ADDRESS, mode: TERMINATION, data: END_OF_OBJECT }];
    for (let at = 0; at < triplets.length; at += TRIPLETS_PER_PACKET) {
      enhancements.push(packet(enhancements.length, triplets.slice(at, at + TRIPLETS_PER_PACKET)));
    }
    frames.push({ source: "local", kind: "passive", number });
  }
  if (enhancements.length > MOST_PACKETS) {
    throw new RangeError(`the page's objects need ${enhancements.length} packets X/26, and a page has ${MOST_PACKETS}`);
  }
  return { enhancements, frames };
}
