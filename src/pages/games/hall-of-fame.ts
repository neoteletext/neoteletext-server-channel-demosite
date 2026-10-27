// The best scores of the arcade's games, kept by the site.

import { Listeners, type Unlisten } from "../../parts/listeners.ts";

export interface Score {
  readonly game: string;
  readonly score: number;
  /** The viewer's session, as they have no name here. */
  readonly player: number;
}

/** The scores kept. */
const MOST_SCORES = 10;

export class HallOfFame {
  #scores: readonly Score[] = [];
  readonly #listeners = new Listeners();

  /** Best first. */
  get scores(): readonly Score[] {
    return this.#scores;
  }

  post(score: Score): void {
    if (score.score <= 0) {
      return;
    }
    this.#scores = [...this.#scores, score].toSorted((one, two) => two.score - one.score).slice(0, MOST_SCORES);
    this.#listeners.tell();
  }

  listen(listener: () => void): Unlisten {
    return this.#listeners.listen(listener);
  }
}
