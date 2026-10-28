// Page 109, what this is, and the keys.

import { Colour } from "neoteletext-server-ts-protocol";
import { Gap, h, KeyHelp, type PageSpec, Paragraph } from "neoteletext-server-ts-ui-components";
import { frame } from "../../parts/frame.ts";
import { LOOKS } from "../../site/looks.ts";
import { PAGES } from "../../site/page-numbers.ts";
import { servicesPrompts } from "./prompts.ts";

const ABOUT = [
  "This is a demonstration of what a teletext service can be: news and live services, things to fill in and vote on, games, music, adventures and pictures.",
  "Every page is a tree of components, from the component library for NeoTeletext channels, as a web page is made of React's.",
] as const;

export function aboutPage(): PageSpec {
  return {
    page: PAGES.about,
    title: "About",
    root: () =>
      frame(
        { look: LOOKS.services, title: "About this demo", prompts: servicesPrompts(["Long read", PAGES.longRead], ["Behind", PAGES.behind]) },
        ...ABOUT.map((text, index) => [
          h(Paragraph, { key: `text${index}`, text, foreground: index === 0 ? Colour.White : Colour.Cyan }),
          h(Gap, { key: `gap${index}` }),
        ]),
        h(KeyHelp, {
          columns: 2,
          keys: [
            ["0-9", "A page"],
            ["Colours", "Fastext"],
            ["Arrows", "Choose"],
            ["Enter", "Open, play"],
            ["Tab", "Next part"],
            ["Index", "Page 100"],
          ],
        }),
      ),
  };
}
