// You and this channel: what the channel knows of the viewer and keeps for
// them (viewer-state.md VS-401 to VS-409), on magazine 7, a page for each:
// whether it knows them, a visit or remembered, a count kept for them,
// forget me, and what it keeps.

import { h } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { type Area, areaPrompts } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { ForgetMe } from "./forget-me.ts";
import { KeptHere } from "./kept-here.ts";
import { RememberMe } from "./remember-me.ts";
import { VisitCounter } from "./visit-counter.ts";
import { WhatWeKnow } from "./what-we-know.ts";

/** Each page: its number, title, menu words and body. */
const VIEWER_PAGES = [
  { page: PAGES.known, title: "What we know of you", about: "Whether this channel knows you", body: WhatWeKnow },
  { page: PAGES.remembered, title: "Visit or remembered", about: "How long what is kept lasts", body: RememberMe },
  { page: PAGES.counter, title: "Visit counter", about: "A count kept for you", body: VisitCounter },
  { page: PAGES.forget, title: "Forget me", about: "Delete all that is kept for you", body: ForgetMe },
  { page: PAGES.kept, title: "What is kept", about: "What this channel keeps, and why", body: KeptHere },
] as const;

export const VIEWER_AREA: Area = {
  name: "You here",
  about: "What this channel knows of you",
  look: LOOKS.viewer,
  menu: PAGES.viewer,
  pages: () =>
    VIEWER_PAGES.map(({ page, title, about, body }) => ({
      about,
      spec: {
        page,
        title,
        // What the channel knows of each viewer: a copy of the page each.
        perViewer: true,
        root: () => frame({ look: LOOKS.viewer, title, prompts: areaPrompts(["You here", PAGES.viewer], ["Forget me", PAGES.forget]) }, h(body, {})),
      },
    })),
};
