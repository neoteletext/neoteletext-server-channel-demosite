// The audio pages' Fastext: their menu, the index, and two of their own.

import type { Prompts } from "neoteletext-server-ts-ui-components";
import { areaPrompts } from "../../site/area.ts";
import { PAGES } from "../../site/page-numbers.ts";

export function audioPrompts(...others: Prompts): Prompts {
  return areaPrompts(["Audio", PAGES.audio], ...others);
}
