// Page 602, every picture at every level it was converted to, a sub-page
// each, in captions.tsv's order: hundreds of sub-pages on one page, the
// standard's own limit being thousands (the server's decision 10). The
// server serves each sub-page as a file of its own, so a viewer fetches
// only those it steps to. One copy, the same for everyone.

import type { FastextLinks } from "neoteletext-server-ts-protocol";
import { type Child, Component, h, type PageSpec, Placeholder, RawSubPage } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LEVELS, type Picture } from "../../pictures/picture.ts";
import { areaPrompts } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";

const PROMPTS = areaPrompts(["Gallery", PAGES.gallery]);
/** Each sub-page's red and green links: the gallery and the index, as the frame's prompts. */
const LINKS: FastextLinks = [PAGES.gallery, PAGES.index, null, null];

/** Every picture's sub-pages, a level each, each titled with its level and caption. */
class EveryPicture extends Component<{ readonly pictures: readonly Picture[] }> {
  override render(): Child {
    return this.props.pictures.flatMap((picture) =>
      picture.levels.map(({ level, tti }) =>
        h(RawSubPage, {
          key: `${picture.name}-${level}`,
          tti,
          title: `${LEVELS.find((each) => each.level === level)?.name ?? level}: ${picture.caption}`,
          background: LOOKS.gallery.background,
          foreground: LOOKS.gallery.foreground,
          fastext: LINKS,
          index: PAGES.index,
        }),
      ),
    );
  }
}

export function everyPicturePage(pictures: readonly Picture[]): PageSpec {
  return {
    page: PAGES.everyPicture,
    title: "Every picture",
    root: () =>
      pictures.length === 0
        ? frame(
            { look: LOOKS.gallery, title: "Every picture", prompts: PROMPTS },
            h(Placeholder, { text: "No pictures: the channel was started without them" }),
          )
        : h(EveryPicture, { pictures }),
  };
}
