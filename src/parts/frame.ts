// The frame every page is in, in its area's look; Index goes to page 100.
// Its title band names the viewer's language after the page's title, and
// its captions are the site's own English (REQ-2218): only what a page
// shows as a sample is in the viewer's language.

import { type Child, Component, type Element, ENGLISH, Frame, type FrameProps, h, type Prompts } from "neoteletext-server-ts-ui-components";
import { titleIn } from "../pages/languages/sample-text.ts";
import type { Look } from "../site/looks.ts";
import { PAGES } from "../site/page-numbers.ts";

/** What a frame shows around its body. */
export interface Framing {
  readonly look: Look;
  readonly title: string;
  readonly prompts: Prompts;
  readonly hint?: string;
}

/** The library's Frame in English, its title naming the viewer's language. */
class SiteFrame extends Component<FrameProps> {
  override render(): Child {
    // Unmounted, as the library's probe of what a page needs renders it, there is no viewer: the title alone, and the probe goes on to the body.
    const title = this.mounted ? titleIn(this.props.title, this.services.language(this.services.session), this.services.languages()) : this.props.title;
    return h(Frame, { ...this.props, title, language: ENGLISH }, ...(this.props.children ?? []));
  }
}

/** A frame of `framing` over `body`. */
export function frame(framing: Framing, ...body: Child[]): Element {
  const { look, title, prompts, hint } = framing;
  return h(
    SiteFrame,
    { title, background: look.background, foreground: look.foreground, prompts, index: PAGES.index, ...(hint === undefined ? {} : { hint }) },
    ...body,
  );
}
