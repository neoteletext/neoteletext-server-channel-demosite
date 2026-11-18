// Animation, on pages 150 to 155: what a teletext page can do by itself in
// the viewer's browser (neoteletext-common's docs/animation.md and
// docs/page-rules.md). The menu is the component library's; the pages it
// lists are the channel's own (animation-pages.ts), which the library
// does not draw.

import { h, type PageSpec } from "neoteletext-server-ts-ui-components";

import { frame } from "../../parts/frame.ts";
import { PageMenu } from "../../parts/page-menu.ts";
import type { Area } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { ANIMATION_LISTED } from "./animation-pages.ts";

const NAME = "Animation";

function menuPage(): PageSpec {
  return {
    page: PAGES.animation,
    title: NAME,
    section: NAME,
    root: () =>
      frame(
        {
          look: LOOKS.animation,
          title: NAME,
          prompts: [
            ["Index", PAGES.index],
            ["Flash", PAGES.flash],
            ["Sprites", PAGES.sprites],
            ["Swap", PAGES.swap],
          ],
        },
        h(PageMenu, { entries: ANIMATION_LISTED.map(({ page, title, about }) => ({ page, label: title, about })) }),
      ),
  };
}

export const ANIMATION_AREA: Area = {
  name: NAME,
  about: "Sprites, flash and rules, in the browser",
  look: LOOKS.animation,
  menu: PAGES.animation,
  // Its pages are not the library's: the menu lists them itself.
  pages: () => [],
  menuPage,
};
