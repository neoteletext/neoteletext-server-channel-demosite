// The best scores of the arcade's games, kept by the site in the channel's
// store so that they outlast the program (REQ-1057).

import type { StateStore } from "neoteletext-server-ts-ui-components";
import { Listeners, type Unlisten } from "../../parts/listeners.ts";

export interface Score {
  readonly game: string;
  readonly score: number;
  /** The viewer's connection, as they have no name here. */
  readonly player: number;
}

/** The scores kept. */
const MOST_SCORES = 10;
/** The longest game's name kept: the arcade's are shorter. */
const LONGEST_GAME = 40;
/** What the scores are kept under, and the version of their shape: raised when it changes, which drops what was kept. */
const KEPT_NAME = "hall-of-fame";
const KEPT_VERSION = 1;

/** Whether `value` is a score as the hall keeps one; what the store gives back is checked, as any file read is. */
function isScore(value: unknown): value is Score {
  if (typeof value !== "object" || value === null || !("game" in value) || !("score" in value) || !("player" in value)) {
    return false;
  }
  const { game, score, player } = value;
  return (
    typeof game === "string" &&
    game.length <= LONGEST_GAME &&
    typeof score === "number" &&
    Number.isSafeInteger(score) &&
    score > 0 &&
    typeof player === "number" &&
    Number.isSafeInteger(player) &&
    player >= 0
  );
}

export class HallOfFame {
  #scores: readonly Score[];
  readonly #listeners = new Listeners();
  readonly #store: StateStore;

  /** The hall kept in `store`, or an empty one when it keeps none that reads. */
  constructor(store: StateStore) {
    this.#store = store;
    const kept = store.shared(KEPT_NAME, KEPT_VERSION);
    this.#scores = Array.isArray(kept) && kept.length <= MOST_SCORES && kept.every((entry: unknown) => isScore(entry)) ? kept : [];
  }

  /** Best first. */
  get scores(): readonly Score[] {
    return this.#scores;
  }

  post(score: Score): void {
    if (score.score <= 0) {
      return;
    }
    this.#scores = [...this.#scores, score].toSorted((one, two) => two.score - one.score).slice(0, MOST_SCORES);
    this.#store.keepShared(KEPT_NAME, KEPT_VERSION, this.#scores);
    this.#listeners.tell();
  }

  listen(listener: () => void): Unlisten {
    return this.#listeners.listen(listener);
  }
}
