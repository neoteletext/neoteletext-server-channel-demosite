// The adventures' pages: one world each.

import { h, type PageSpec } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { areaPrompts } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { AdventureView } from "./adventure-view.ts";
import type { World } from "./world.ts";

export function adventurePage(page: number, world: World, other: readonly [label: string, page: number]): PageSpec {
  return {
    page,
    title: world.title,
    perViewer: true,
    root: () =>
      frame(
        { look: LOOKS.adventure, title: world.title, prompts: areaPrompts(["Adventures", PAGES.adventure], other), hint: "Type a command and press Enter" },
        h(AdventureView, { world }),
      ),
  };
}
