// The pictures in a folder given on the command line: captions.tsv, a
// line for each (name, group, caption), and each one's three TTI files.
// Everything in it is untrusted: a name is only ever a file's stem, every
// file is bounded, a TTI file must be seven-bit text, as TTI is, and
// anything that fails a check is left out.

import { join } from "node:path";

import { readTti } from "neottx-server-ts-protocol";
import { isGroup } from "./groups.ts";
import { LEVELS, type Picture } from "./picture.ts";
import { readSmall } from "./read-small.ts";

/** The largest TTI file read: a page with every enhancement packet is a few kilobytes. */
const LONGEST_TTI = 64 * 1024;
/** The largest captions.tsv read: thousands of lines of a few hundred characters. */
const LONGEST_CAPTIONS = 4 * 1024 * 1024;
/** The most pictures taken, so a huge folder cannot make a huge list. */
const MOST_PICTURES = 5_000;
/** The longest caption kept; the page shows less. */
const LONGEST_CAPTION = 400;
/** A name is a file's stem: letters, digits, - and _ only, never a path. */
const NAME = /^[A-Za-z0-9_-]{1,32}$/u;
/** TTI is seven-bit text: no character past this. */
const SEVEN_BIT_MOST = 0x7f;

function isSevenBit(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    if ((text.codePointAt(index) ?? 0) > SEVEN_BIT_MOST) {
      return false;
    }
  }
  return true;
}

/** `text` as a TTI page if it is one: seven-bit, and read by the protocol's TTI reader to at least one page. */
function checkedTti(text: string | undefined): string | undefined {
  if (text === undefined || !isSevenBit(text)) {
    return undefined;
  }
  try {
    return readTti(text.replaceAll("\r", "")).length > 0 ? text : undefined;
  } catch {
    return undefined;
  }
}

/** One captions.tsv line's picture, or undefined when the line or its files fail a check. */
function pictureOf(folder: string, line: string): Picture | undefined {
  const [name = "", group = "", ...rest] = line.replace(/\r$/u, "").split("\t");
  if (!NAME.test(name) || !isGroup(group) || rest.length === 0) {
    return undefined;
  }
  const levels = LEVELS.flatMap(({ level }) => {
    // latin1 keeps every byte as one character, so a byte past seven bits is seen and refused.
    const tti = checkedTti(readSmall(join(folder, `${name}_${level}.tti`), "latin1", LONGEST_TTI));
    return tti === undefined ? [] : [{ level, tti }];
  });
  if (levels.length === 0) {
    return undefined;
  }
  return { name, group, caption: rest.join(" ").slice(0, LONGEST_CAPTION), levels };
}

/** The pictures in `folder`, in captions.tsv's order; none when it has no captions.tsv. */
export function loadPictures(folder: string): Picture[] {
  const captions = readSmall(join(folder, "captions.tsv"), "utf8", LONGEST_CAPTIONS);
  if (captions === undefined) {
    return [];
  }
  const pictures: Picture[] = [];
  const names = new Set<string>();
  for (const line of captions.split("\n")) {
    const picture = pictureOf(folder, line);
    if (picture !== undefined && !names.has(picture.name)) {
      names.add(picture.name);
      pictures.push(picture);
    }
    if (pictures.length >= MOST_PICTURES) {
      break;
    }
  }
  return pictures;
}
