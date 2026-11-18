// The NeoTeletext demo site: what a teletext service can be, as one
// channel built on the component library, which the server starts from
// its channels.json (DOC-1964).
//
//   node src/main.ts [--pictures FOLDER] [--state FILE]
//
// FOLDER holds the converted pictures for the gallery: captions.tsv and
// each picture's NAME_l15.tti, NAME_l25.tti and NAME_l35.tti. Without it
// the gallery says it has none.
//
// FILE is the SQLite database the channel keeps what outlasts it in
// (REQ-1057): the guestbook, the hall of fame, the poll's votes, and each
// viewer's ballot, visit count and language, under the viewer's handle. It
// is made, with its folder, when it is not there.
// Without it, tmp/state.sqlite in this repository, which no deploy copies;
// a live channel names a file outside the folder a deploy replaces.

import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { runChannel } from "neoteletext-server-ts-protocol";
import { ComponentChannel, SqliteStateStore } from "neoteletext-server-ts-ui-components";
import { standInText } from "./pages/languages/sample-text.ts";
import { pages } from "./pages.ts";
import { loadPictures } from "./pictures/load-pictures.ts";
import { REFUSALS } from "./refusals.ts";
import { makeSite } from "./site/site.ts";

/** Where the channel keeps what outlasts it when no file is named: this repository's ignored tmp/. */
const LOCAL_STATE = fileURLToPath(new URL("../tmp/state.sqlite", import.meta.url));

const { values } = parseArgs({ options: { pictures: { type: "string" }, state: { type: "string" } }, strict: true });
const pictures = values.pictures === undefined ? [] : loadPictures(values.pictures);
const statePath = values.state ?? LOCAL_STATE;
const store = new SqliteStateStore(statePath);
const specs = pages(makeSite(pictures, store));
process.stderr.write(`demosite: ${specs.length} pages, ${pictures.length} pictures, kept in ${statePath}\n`);

// Every page is drawn in each viewer's language, the site's words as text of it (REQ-2218, DEC-2233).
// The library writes no rule table (`ruleTables: "none"`): every page has the
// server's default table, by `"default_rules": "send_all"` in the channel's
// entry of channels.json, and is sent every input as before protocol 14
// (DEC-6525 item 9; page-rules.md RULE-53). TODO-6544 gives the pages their own tables.
await runChannel([new ComponentChannel(specs, { ruleTables: "none", standIn: standInText, state: store }), REFUSALS]);
