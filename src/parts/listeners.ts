// Who is told when a record the site keeps changes: each page showing it.

/** Stops a listener being told. */
export type Unlisten = () => void;

/** A set of listeners, each told of every change. */
export class Listeners {
  readonly #listeners = new Set<() => void>();

  listen(listener: () => void): Unlisten {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  tell(): void {
    for (const listener of this.#listeners) {
      listener();
    }
  }
}
