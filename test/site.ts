// The site, driven as the server drives it, with the test's one picture.

import { join } from "node:path";

import { Harness, fakeOpus } from "neoteletext-server-ts-protocol/testing";
import { ComponentChannel, type PageSpec } from "neoteletext-server-ts-ui-components";
import { pages } from "../src/pages.ts";
import { loadPictures } from "../src/pictures/load-pictures.ts";
import type { Picture } from "../src/pictures/picture.ts";
import { makeSite } from "../src/site/site.ts";

/** The test's pictures folder: one picture, a001, at its three levels. */
export const PICTURES = join(import.meta.dirname, "pictures");

/** When the tests' channel starts: 27 October 2026, UTC. */
const STARTED = Date.UTC(2026, 9, 27);

/** The site with `pictures`, and its pages. */
export function siteOf(pictures: readonly Picture[]): { harness: Harness; specs: PageSpec[] } {
  const specs = pages(makeSite(pictures));
  return { harness: new Harness([new ComponentChannel(specs, { opus: fakeOpus() })], { epochMs: STARTED }), specs };
}

/** The site with the test's pictures, or none, and its pages; its sounds encoded by the protocol's fake encoder, which runs nothing. */
export function site(withPictures = true): { harness: Harness; specs: PageSpec[] } {
  return siteOf(withPictures ? loadPictures(PICTURES) : []);
}
