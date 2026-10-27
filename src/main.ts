// The NeoTeletext demo site: what a teletext service can be, as one
// channel built on the component library, which the server starts from
// its channels.json (teletext-server's docs/applications.md).
//
//   node src/main.ts [--pictures FOLDER]
//
// FOLDER holds the converted pictures for the gallery: captions.tsv and
// each picture's NAME_l15.tti, NAME_l25.tti and NAME_l35.tti. Without it
// the gallery says it has none.

import { parseArgs } from "node:util";

import { runChannel } from "neottx-server-ts-protocol";
import { ComponentChannel } from "neottx-server-ts-ui-components";
import { pages } from "./pages.ts";
import { loadPictures } from "./pictures/load-pictures.ts";
import { makeSite } from "./site/site.ts";

const { values } = parseArgs({ options: { pictures: { type: "string" } }, strict: true });
const pictures = values.pictures === undefined ? [] : loadPictures(values.pictures);
const specs = pages(makeSite(pictures));
process.stderr.write(`demosite: ${specs.length} pages, ${pictures.length} pictures\n`);

await runChannel([new ComponentChannel(specs)]);
