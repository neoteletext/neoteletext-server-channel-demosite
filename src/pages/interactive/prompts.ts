// The interactive pages' Fastext: their menu, the index, and two of their own.

import type { Prompts } from "neottx-server-ts-ui-components";
import { areaPrompts } from "../../site/area.ts";
import { PAGES } from "../../site/page-numbers.ts";

export function interactivePrompts(...others: Prompts): Prompts {
  return areaPrompts(["Interactive", PAGES.interactive], ...others);
}
