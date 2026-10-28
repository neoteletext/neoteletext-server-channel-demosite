// Page 600, the gallery: the converted pictures by group.

import { h, type PageSpec } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import type { Picture } from "../../pictures/picture.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { GalleryView } from "./gallery-view.ts";

export function galleryPage(pictures: readonly Picture[]): PageSpec {
  return {
    page: PAGES.gallery,
    title: "Gallery",
    section: "Gallery",
    root: () =>
      frame(
        {
          look: LOOKS.gallery,
          title: "Gallery",
          prompts: [
            ["Index", PAGES.index],
            ["Services", PAGES.services],
            ["Audio", PAGES.audio],
          ],
          hint: "Choose a picture: Enter opens it",
        },
        h(GalleryView, { pictures }),
      ),
  };
}
