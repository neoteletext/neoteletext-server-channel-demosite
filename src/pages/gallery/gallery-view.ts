// The gallery's contents: a tab for each group of pictures, each a list
// of their captions; choosing one opens it on 601.

import { type Child, ChoiceList, Component, h, Placeholder, TabView } from "neoteletext-server-ts-ui-components";
import { GROUPS } from "../../pictures/groups.ts";
import type { Picture } from "../../pictures/picture.ts";
import { PAGES } from "../../site/page-numbers.ts";

/** The captions shown at once. */
const SHOWN = 16;

export class GalleryView extends Component<{ readonly pictures: readonly Picture[] }> {
  override render(): Child {
    const groups = GROUPS.map(({ letter, name }) => ({ letter, name, pictures: this.props.pictures.filter((picture) => picture.group === letter) })).filter(
      (group) => group.pictures.length > 0,
    );
    if (groups.length === 0) {
      return h(Placeholder, { text: "No pictures: the channel was started without its pictures folder" });
    }
    return h(
      TabView,
      { tabs: groups.map((group) => group.name), style: "chips", initial: 0 },
      ...groups.map((group) =>
        h(ChoiceList<Picture>, {
          key: group.letter,
          items: group.pictures,
          text: (picture: Picture) => picture.caption,
          shown: SHOWN,
          autoFocus: true,
          onChoose: (index: number, session: number) => {
            const picture = group.pictures[index];
            if (picture !== undefined) {
              this.services.goto(session, PAGES.picture, { picture: picture.name });
            }
          },
        }),
      ),
    );
  }
}
