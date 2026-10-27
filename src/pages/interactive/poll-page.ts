// Page 204, a live poll: each vote is seen by every viewer as it is cast.

import { Colour } from "neottx-server-ts-protocol";
import { Gap, h, type PageSpec, Paragraph, Poll, type Tally } from "neottx-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { interactivePrompts } from "./prompts.ts";

export function pollPage(tally: Tally): PageSpec {
  return {
    page: PAGES.poll,
    title: "Poll",
    root: () =>
      frame(
        { look: LOOKS.interactive, title: "Poll", prompts: interactivePrompts(["Quiz", PAGES.quiz], ["Guestbook", PAGES.guestbook]) },
        h(Paragraph, { text: "Which was the best teletext service?", foreground: Colour.Yellow }),
        h(Gap, {}),
        h(Poll, { tally }),
      ),
  };
}
