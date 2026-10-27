// Interactive, magazine 2: pages that answer back.

import type { Area } from "../../site/area.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { calculatorPage } from "./calculator-page.ts";
import { formPage } from "./form-page.ts";
import { guestbookPage } from "./guestbook-page.ts";
import { paintPage } from "./paint-page.ts";
import { pollPage } from "./poll-page.ts";
import { quizPage } from "./quiz-page.ts";

export const INTERACTIVE: Area = {
  name: "Interactive",
  about: "Calculator, forms, guestbook, poll, quiz, paint",
  look: LOOKS.interactive,
  menu: PAGES.interactive,
  pages: (site) => [
    { spec: calculatorPage(), about: "A pocket calculator" },
    { spec: formPage(), about: "A form in four steps" },
    { spec: guestbookPage(site.guestbook), about: "Sign it; everyone sees" },
    { spec: pollPage(site.poll), about: "Vote, and watch the votes come in" },
    { spec: quizPage(), about: "Six questions on teletext" },
    { spec: paintPage(), about: "Draw in mosaic" },
  ],
};
