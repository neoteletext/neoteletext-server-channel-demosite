// The news: made-up stories, as a teletext service carried them, each on
// a page of its own from 111.

import type { Block } from "neottx-server-ts-ui-components";

export interface Story {
  readonly headline: string;
  readonly section: string;
  readonly blocks: readonly Block[];
}

export const STORIES: readonly Story[] = [
  {
    headline: "Teletext returns as a live service on the web",
    section: "Technology",
    blocks: [
      { kind: "paragraph", text: "A teletext service has gone live again, forty years after the first pages were broadcast, this time over the internet." },
      { kind: "paragraph", text: "Its pages are drawn as they always were: forty columns, twenty-five rows, eight colours and blocky mosaic graphics." },
      { kind: "quote", text: '"The limits are the point," its makers said. "A page has to say what it means in a thousand characters."' },
      { kind: "paragraph", text: "Unlike the broadcasts, the new pages answer back: viewers vote, play games and draw on them." },
    ],
  },
  {
    headline: "Rain moves east as a cold front crosses the country",
    section: "Weather",
    blocks: [
      { kind: "paragraph", text: "A band of heavy rain will move east through the day, clearing to sunshine and scattered showers by evening." },
      { kind: "heading", text: "The outlook" },
      { kind: "paragraph", text: "Tomorrow will be brighter but colder, with a frost in sheltered places overnight. The weather page, 102, has the week." },
    ],
  },
  {
    headline: "Markets steady after a week of swings",
    section: "Business",
    blocks: [
      { kind: "paragraph", text: "Shares closed little changed on Friday after five days in which the main index rose and fell by more than two per cent." },
      { kind: "item", text: "Mining shares led the risers." },
      { kind: "item", text: "Retailers fell back on weaker spending figures." },
      { kind: "paragraph", text: "The markets page, 103, has the figures as they move." },
    ],
  },
  {
    headline: "Village team reaches the cup final at last",
    section: "Sport",
    blocks: [
      { kind: "paragraph", text: "A village team of part-timers has reached the county cup final for the first time in its hundred-year history." },
      { kind: "paragraph", text: "Its winning goal came in the last minute, from a defender who works nights as a baker." },
    ],
  },
  {
    headline: "Night sky: a meteor shower peaks this weekend",
    section: "Science",
    blocks: [
      { kind: "paragraph", text: "Up to fifty meteors an hour may be seen on Saturday night, away from street lights, looking north-east after midnight." },
      { kind: "heading", text: "How to watch" },
      { kind: "item", text: "Let your eyes adjust for twenty minutes." },
      { kind: "item", text: "Lie back and take in as much sky as you can." },
    ],
  },
  {
    headline: "Library lends its first musical instruments",
    section: "Arts",
    blocks: [
      { kind: "paragraph", text: "The town library is now lending guitars, keyboards and a drum kit, on the same card as its books." },
      { kind: "paragraph", text: "If you have no instrument to hand, the audio pages from 500 have a piano, drums and a synth." },
    ],
  },
];
