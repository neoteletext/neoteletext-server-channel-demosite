// Page 306, the hall of fame: the best scores of the arcade's games, as
// they are made.

import { type Child, Component, DataTable, h, type PageSpec } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import type { Unlisten } from "../../parts/listeners.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import type { HallOfFame } from "./hall-of-fame.ts";
import { gamesPrompts } from "./prompts.ts";

const PLACE_CELLS = 4;
const GAME_CELLS = 13;
const PLAYER_CELLS = 11;
const SCORE_CELLS = 8;
const SHOWN = 10;

class Hall extends Component<{ readonly hall: HallOfFame }> {
  #unlisten: Unlisten | null = null;

  override componentDidMount(): void {
    this.#unlisten = this.props.hall.listen(() => {
      this.forceUpdate();
    });
  }

  override componentWillUnmount(): void {
    this.#unlisten?.();
  }

  override render(): Child {
    return h(DataTable, {
      shared: true,
      shown: SHOWN,
      striped: true,
      empty: "No scores yet: play Breakout, Invaders or the cave",
      columns: [
        { title: "No", width: PLACE_CELLS, align: "right" },
        { title: "Game", width: GAME_CELLS },
        { title: "Player", width: PLAYER_CELLS },
        { title: "Score", width: SCORE_CELLS, align: "right" },
      ],
      rows: this.props.hall.scores.map((score, place) => [String(place + 1), score.game, `Viewer ${score.player}`, String(score.score)]),
    });
  }
}

export function hallPage(hall: HallOfFame): PageSpec {
  return {
    page: PAGES.hall,
    title: "Hall of fame",
    root: () =>
      frame({ look: LOOKS.games, title: "Hall of fame", prompts: gamesPrompts(["Breakout", PAGES.breakout], ["Invaders", PAGES.invaders]) }, h(Hall, { hall })),
  };
}
