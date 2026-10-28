// Page 601, a picture at its three levels, a sub-page each, as the
// converter made them, and a sub-page that says what it is.

import { Colour, type FastextLinks } from "neoteletext-server-ts-protocol";
import { type Child, Component, Gap, h, type PageSpec, Paragraph, Placeholder, RawSubPage, Text } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LEVELS, type Picture } from "../../pictures/picture.ts";
import { areaPrompts } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";

const PROMPTS = areaPrompts(["Gallery", PAGES.gallery]);
/** The pictures' red and green links: the gallery and the index, as the frame's prompts. */
const LINKS: FastextLinks = [PAGES.gallery, PAGES.index, null, null];

/** What the viewer was sent here with: a picture's name, which must be one of the pictures'. */
function chosen(pictures: ReadonlyMap<string, Picture>, name: unknown): Picture | undefined {
  return typeof name === "string" ? pictures.get(name) : undefined;
}

/** The picture's sub-pages: one for each level it was converted to, then one about it. */
class PictureSubPages extends Component<{ readonly picture: Picture }> {
  override render(): Child {
    const { picture } = this.props;
    const levels = picture.levels.map(({ level, tti }) =>
      h(RawSubPage, {
        key: level,
        tti,
        title: LEVELS.find((each) => each.level === level)?.name ?? level,
        background: LOOKS.gallery.background,
        foreground: LOOKS.gallery.foreground,
        fastext: LINKS,
        index: PAGES.index,
      }),
    );
    const about = frame(
      { look: LOOKS.gallery, title: "About the picture", prompts: PROMPTS },
      h(Text, { text: picture.name, foreground: Colour.Yellow }),
      h(Gap, {}),
      h(Paragraph, { text: picture.caption }),
      h(Gap, {}),
      h(Paragraph, { text: "The sub-pages before this show it at each level of teletext it was converted to.", foreground: Colour.Cyan }),
    );
    return [...levels, about];
  }
}

export function picturePage(pictures: readonly Picture[]): PageSpec {
  const byName = new Map(pictures.map((picture) => [picture.name, picture]));
  return {
    page: PAGES.picture,
    title: "Picture",
    perViewer: true,
    root: (params) => {
      const picture = chosen(byName, params?.["picture"]) ?? pictures[0];
      if (picture === undefined) {
        return frame(
          { look: LOOKS.gallery, title: "Picture", prompts: PROMPTS },
          h(Placeholder, { text: "No pictures: the channel was started without them" }),
        );
      }
      return h(PictureSubPages, { picture });
    },
  };
}
