// Page 202, a form in steps.

import { h, type PageSpec } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { SignUpForm } from "./form.ts";

export function formPage(): PageSpec {
  return {
    page: PAGES.form,
    title: "Sign up",
    // The wizard's Back and Next are the red and green keys, so this page has no Fastext of its own.
    root: () => frame({ look: LOOKS.interactive, title: "Sign up", prompts: [] }, h(SignUpForm, {})),
  };
}
