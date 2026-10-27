// The frame every page is in, in its area's look; Index goes to page 100.

import { type Child, type Element, Frame, h, type Prompts } from "neottx-server-ts-ui-components";
import type { Look } from "../site/looks.ts";
import { PAGES } from "../site/page-numbers.ts";

/** What a frame shows around its body. */
export interface Framing {
  readonly look: Look;
  readonly title: string;
  readonly prompts: Prompts;
  readonly hint?: string;
}

/** A frame of `framing` over `body`. */
export function frame(framing: Framing, ...body: Child[]): Element {
  const { look, title, prompts, hint } = framing;
  return h(
    Frame,
    { title, background: look.background, foreground: look.foreground, prompts, index: PAGES.index, ...(hint === undefined ? {} : { hint }) },
    ...body,
  );
}
