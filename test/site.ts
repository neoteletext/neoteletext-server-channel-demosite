// The site, driven as the server drives it, with the test's one picture.

import { join } from "node:path";

import type { SubPageContent } from "neoteletext-server-ts-protocol";
import { Harness, fakeOpus } from "neoteletext-server-ts-protocol/testing";
import { ComponentChannel, IN_MEMORY, type PageSpec, SqliteStateStore } from "neoteletext-server-ts-ui-components";
import { standInText } from "../src/pages/languages/sample-text.ts";
import { pages } from "../src/pages.ts";
import { loadPictures } from "../src/pictures/load-pictures.ts";
import type { Picture } from "../src/pictures/picture.ts";
import { makeSite } from "../src/site/site.ts";

/** The test's pictures folder: one picture, a001, at its three levels. */
export const PICTURES = join(import.meta.dirname, "pictures");

/** When the tests' channel starts: 27 October 2026, UTC. */
const STARTED = Date.UTC(2026, 9, 27);

/** The site with `pictures`, and its pages, keeping what lasts in `store`: a database in memory of its own when none is given. */
export function siteOf(pictures: readonly Picture[], store: SqliteStateStore = new SqliteStateStore(IN_MEMORY)): { harness: Harness; specs: PageSpec[] } {
  const specs = pages(makeSite(pictures, store));
  return {
    harness: new Harness([new ComponentChannel(specs, { opus: fakeOpus(), ruleTables: "none", standIn: standInText, state: store })], { epochMs: STARTED }),
    specs,
  };
}

/** The site with the test's pictures, or none, and its pages; its sounds encoded by the protocol's fake encoder, which runs nothing. */
export function site(withPictures = true): { harness: Harness; specs: PageSpec[] } {
  return siteOf(withPictures ? loadPictures(PICTURES) : []);
}

/** The latest sub-page `connection` was sent of `page`: its own copy, else the channel's. */
export function contentOf(harness: Harness, connection: number, page: number): SubPageContent | undefined {
  return (harness.channel.copy(connection, page) ?? harness.channel.copy("channel", page))?.at(-1)?.content;
}

/** Every text run of `content`, joined by line breaks: what the server encodes for the page. */
export function runsText(content: SubPageContent | undefined): string {
  return (content?.text ?? []).map((run) => run.text).join("\n");
}
