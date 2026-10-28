// Page 206, painting in mosaic: a canvas of the page's sixels.

import { Colour } from "neoteletext-server-ts-protocol";
import { h, type PageSpec, PaintCanvas } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { interactivePrompts } from "./prompts.ts";

/** The canvas: the page's width, the body's rows. */
const CANVAS_COLUMNS = 40;
const CANVAS_ROWS = 18;

export function paintPage(): PageSpec {
  return {
    page: PAGES.paint,
    title: "Paint",
    root: () =>
      frame(
        { look: LOOKS.interactive, title: "Paint", prompts: interactivePrompts(["Guestbook", PAGES.guestbook], ["Calculator", PAGES.calculator]) },
        h(PaintCanvas, { columns: CANVAS_COLUMNS, rows: CANVAS_ROWS, foreground: Colour.Yellow, brush: true }),
      ),
  };
}
