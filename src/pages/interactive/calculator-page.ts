// Page 201, the calculator.

import { h, type PageSpec } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { Calculator } from "./calculator.ts";
import { interactivePrompts } from "./prompts.ts";

export function calculatorPage(): PageSpec {
  return {
    page: PAGES.calculator,
    title: "Calculator",
    root: () =>
      frame({ look: LOOKS.interactive, title: "Calculator", prompts: interactivePrompts(["Form", PAGES.form], ["Quiz", PAGES.quiz]) }, h(Calculator, {})),
  };
}
