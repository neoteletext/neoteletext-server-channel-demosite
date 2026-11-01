// A language page: its ready-made TTI (language-pages.ts, make-language-pages.ts)
// and the window of every character of its sets (character-window.ts), whose
// place is each viewer's own, moved with the arrows, Page Up, Page Down, Home
// and End. The library's own scrolling components write English alone, and a
// page given whole has no cells a wheel or a click can find.

import type { FastextLinks } from "neoteletext-server-ts-protocol";
import { type Child, Component, h, type KeyEvent, listStep, type PageNeeds, RawSubPage } from "neoteletext-server-ts-ui-components";
import { lastTop, windowOf, withWindow } from "./character-window.ts";
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
    const step = listStep(event, windowOf(tti).shown);
    if (step === null) {
      return false;
    }
    const last = lastTop(tti, set);
    const moved = Number.isFinite(step) ? this.state.top + step : step;
    this.setState({ top: Math.max(0, Math.min(last, moved)) });
    return true;
  }
}
