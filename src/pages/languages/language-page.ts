// A language page: its ready-made TTI (language-pages.ts, make-language-pages.ts)
// with everything under its heading in a window (page-window.ts), whose place
// is each viewer's own, moved with the arrows, Page Up, Page Down, Home and
// End. The library's own scrolling components write English alone, and a page
// given whole has no cells a wheel or a click can find.

import type { FastextLinks } from "neoteletext-server-ts-protocol";
import { type Child, Component, h, type KeyEvent, listStep, type PageNeeds, RawSubPage } from "neoteletext-server-ts-ui-components";
import { lastTop, ROWS_SHOWN, rowStep, withWindow } from "./page-window.ts";
import type { SetName } from "./language-sets.ts";

export interface LanguagePageProps {
  /** The page's TTI, without its window. */
  readonly tti: string;
  readonly set: SetName;
  readonly fastext: FastextLinks;
  readonly index: number;
}

interface LanguagePageState {
  /** The first row of the character tables in view. */
  readonly top: number;
}

export class LanguagePage extends Component<LanguagePageProps, LanguagePageState> {
  override state: LanguagePageState = { top: 0 };

  override needs(): PageNeeds {
    return { ownCopy: true };
  }

  override render(): Child {
    const { tti, set, fastext, index } = this.props;
    return h(RawSubPage, { tti: withWindow(tti, set, this.state.top), fastext, index });
  }

  override onKey(event: KeyEvent): boolean {
    const { tti, set } = this.props;
    const moved = listStep(event, ROWS_SHOWN);
    if (moved === null) {
      return false;
    }
    const step = rowStep(set);
    const to = Number.isFinite(moved) ? this.state.top + Math.ceil(Math.abs(moved) / step) * step * Math.sign(moved) : moved;
    this.setState({ top: Math.max(0, Math.min(lastTop(tti, set), to)) });
    return true;
  }
}
