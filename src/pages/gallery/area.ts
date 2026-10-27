// The gallery, magazine 6: converted pictures at three levels of teletext.

import type { Area } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { galleryPage } from "./gallery-page.ts";
import { picturePage } from "./picture-page.ts";

export const GALLERY: Area = {
  name: "Gallery",
  about: "Pictures at three levels of teletext",
  look: LOOKS.gallery,
  menu: PAGES.gallery,
  // The gallery's own page is its menu: it lists the pictures.
  pages: () => [],
  menuPage: (site) => galleryPage(site.pictures),
  unlisted: (site) => [picturePage(site.pictures)],
};
