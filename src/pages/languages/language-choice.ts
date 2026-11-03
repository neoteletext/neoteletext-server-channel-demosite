// The body of the page that chooses the viewer's language (REQ-2218 items 1
// and 3): the library's LanguagePicker, which keeps the choice in the
// `language` cookie and draws every page the viewer has open again in it.
// The page answers an address that names a language too: selected with the
// query `language=TAG`, it sets the cookie and goes to the site's index, so
// a link can open the site in one language.

import { Colour } from "neoteletext-server-ts-protocol";
import {
  BODY_ROWS,
  type Child,
  Component,
  Gap,
  h,
  LANGUAGE_COOKIE,
  LANGUAGE_COOKIE_SECONDS,
  LanguagePicker,
  type PageParams,
  Paragraph,
  Rows,
  Text,
} from "neoteletext-server-ts-ui-components";
import type { LanguageTag } from "neoteletext-server-ts-protocol";
import { ENGLISH_TAG, pageOf } from "./sample-text.ts";

/** The query's name for the language a link opens the site in. */
const LANGUAGE_PARAMETER = "language";

/** The rows above the picker: the note's two, the line naming the language now, and a row under it. */
const ROWS_ABOVE = 4;

export interface LanguageChoiceProps {
  /** What the page was selected with: a language to choose at once, by `LANGUAGE_PARAMETER`, untrusted. */
  readonly params?: PageParams;
  /** Where a link that names a language goes once it is chosen. */
  readonly home: number;
}

/** Each language's name in itself, from its page, for the picker. */
function ownNames(tags: readonly LanguageTag[]): Partial<Record<LanguageTag, string>> {
  return Object.fromEntries(tags.flatMap((tag) => (pageOf(tag) === undefined ? [] : [[tag, pageOf(tag)?.own ?? tag]])));
}

/** The languages a viewer can choose: English first, then the server's in its order. */
function offered(listed: readonly LanguageTag[]): LanguageTag[] {
  return [ENGLISH_TAG, ...listed.filter((tag) => tag !== ENGLISH_TAG)];
}

export class LanguageChoice extends Component<LanguageChoiceProps> {
  /** The language a link named, when it is one of the server's. */
  get #named(): LanguageTag | null {
    const value = this.props.params?.[LANGUAGE_PARAMETER];
    return this.services.languages().find((language) => language.tag === value)?.tag ?? null;
  }

  override componentDidMount(): void {
    const { session } = this.services;
    const named = this.#named;
    if (session === null || named === null) {
      return;
    }
    this.services.setCookie(session, LANGUAGE_COOKIE, named, { path: "/", maxAge: LANGUAGE_COOKIE_SECONDS, sameSite: "Lax" });
    this.services.redirect(session, this.props.home);
  }

  override render(): Child {
    const { session } = this.services;
    const tags = offered(this.services.languages().map((language) => language.tag));
    const now = session === null ? ENGLISH_TAG : this.services.language(session);
    const name = this.services.languages().find((language) => language.tag === now)?.name ?? now;
    return h(
      Rows,
      {},
      h(Paragraph, {
        text: "Choose the language every page is drawn in. It is kept in a cookie.",
        foreground: Colour.Cyan,
        lines: 2,
      }),
      h(Text, { text: `Now: ${name}`, foreground: Colour.Yellow }),
      h(Gap, {}),
      h(LanguagePicker, { shown: BODY_ROWS - ROWS_ABOVE, languages: tags, names: ownNames(tags), autoFocus: true }),
    );
  }
}
