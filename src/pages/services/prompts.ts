// The services' Fastext: the headlines, the index, and two of their own.

import type { Prompts } from "neoteletext-server-ts-ui-components";
import { areaPrompts } from "../../site/area.ts";
import { PAGES } from "../../site/page-numbers.ts";

export function servicesPrompts(...others: Prompts): Prompts {
  return areaPrompts(["Services", PAGES.services], ...others);
}
