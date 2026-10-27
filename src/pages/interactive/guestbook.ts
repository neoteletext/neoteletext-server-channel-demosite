// The guestbook's entries, kept by the site for every viewer to read.

import { Listeners, type Unlisten } from "../../parts/listeners.ts";

export interface Signature {
  readonly name: string;
  readonly message: string;
}

/** The most entries kept: the oldest go first. */
const MOST_ENTRIES = 50;

export class Guestbook {
  #entries: readonly Signature[] = [{ name: "The editor", message: "Welcome! Sign the book below." }];
  readonly #listeners = new Listeners();

  get entries(): readonly Signature[] {
    return this.#entries;
  }

  sign(signature: Signature): void {
    this.#entries = [...this.#entries, signature].slice(-MOST_ENTRIES);
    this.#listeners.tell();
  }

  listen(listener: () => void): Unlisten {
    return this.#listeners.listen(listener);
  }
}
