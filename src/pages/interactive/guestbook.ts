// The guestbook's entries, kept by the site for every viewer to read, in
// the channel's store so that they outlast the program (REQ-1057).

import type { StateStore } from "neoteletext-server-ts-ui-components";
import { Listeners, type Unlisten } from "../../parts/listeners.ts";

export interface Signature {
  readonly name: string;
  readonly message: string;
}

/** The most entries kept: the oldest go first. */
const MOST_ENTRIES = 50;
/** The longest message taken, as the page's field takes it. */
export const LONGEST_MESSAGE = 60;
/** The longest name: "Viewer " and a connection's number, which has at most 16 digits (below 2 to the 53rd). */
const LONGEST_NAME = "Viewer ".length + 16;
/** What the entries are kept under, and the version of their shape: raised when it changes, which drops what was kept. */
const KEPT_NAME = "guestbook";
const KEPT_VERSION = 1;
/** What a book that has never been signed shows. */
const FIRST_ENTRY: Signature = { name: "The editor", message: "Welcome! Sign the book below." };

/** Whether `value` is a signature as the book keeps one; what the store gives back is checked, as any file read is. */
function isSignature(value: unknown): value is Signature {
  if (typeof value !== "object" || value === null || !("name" in value) || !("message" in value)) {
    return false;
  }
  const { name, message } = value;
  return typeof name === "string" && name.length <= LONGEST_NAME && typeof message === "string" && message.length <= LONGEST_MESSAGE;
}

export class Guestbook {
  #entries: readonly Signature[];
  readonly #listeners = new Listeners();
  readonly #store: StateStore;

  /** The book kept in `store`, or a new one when it keeps none that reads. */
  constructor(store: StateStore) {
    this.#store = store;
    const kept = store.shared(KEPT_NAME, KEPT_VERSION);
    this.#entries = Array.isArray(kept) && kept.length <= MOST_ENTRIES && kept.every((entry: unknown) => isSignature(entry)) ? kept : [FIRST_ENTRY];
  }

  get entries(): readonly Signature[] {
    return this.#entries;
  }

  sign(signature: Signature): void {
    this.#entries = [...this.#entries, signature].slice(-MOST_ENTRIES);
    this.#store.keepShared(KEPT_NAME, KEPT_VERSION, this.#entries);
    this.#listeners.tell();
  }

  listen(listener: () => void): Unlisten {
    return this.#listeners.listen(listener);
  }
}
