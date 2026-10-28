// Each area's look: the colour of its title bands and the text on them.

import { Colour } from "neoteletext-server-ts-protocol";

/** A title band's background and the foreground on it. */
export interface Look {
  readonly background: Colour;
  readonly foreground: Colour;
}

export const LOOKS = {
  index: { background: Colour.Blue, foreground: Colour.Yellow },
  services: { background: Colour.Blue, foreground: Colour.White },
  interactive: { background: Colour.Green, foreground: Colour.Black },
  games: { background: Colour.Red, foreground: Colour.Yellow },
  adventure: { background: Colour.Magenta, foreground: Colour.White },
  audio: { background: Colour.Cyan, foreground: Colour.Blue },
  gallery: { background: Colour.Yellow, foreground: Colour.Blue },
} as const satisfies Readonly<Record<string, Look>>;
