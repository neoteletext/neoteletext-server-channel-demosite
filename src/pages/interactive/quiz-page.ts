// Page 205, a quiz answered with the coloured keys.

import { h, type PageSpec, Quiz } from "neottx-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { SOUNDS } from "../../parts/sounds.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { QUESTIONS } from "./questions.ts";

export function quizPage(): PageSpec {
  return {
    page: PAGES.quiz,
    title: "Quiz",
    // The coloured keys answer, so the page has no Fastext of its own.
    root: () =>
      frame({ look: LOOKS.interactive, title: "Teletext quiz", prompts: [] }, h(Quiz, { questions: QUESTIONS, right: SOUNDS.right, wrong: SOUNDS.wrong })),
  };
}
