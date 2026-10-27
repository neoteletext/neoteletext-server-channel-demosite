// A converted picture: the engine's converter makes each at three
// levels of teletext, NAME_l15.tti, NAME_l25.tti and NAME_l35.tti.

/** The levels, by the names the folder's files give them, and what each is called on the page. */
export const LEVELS = [
  { level: "l15", name: "Level 1.5" },
  { level: "l25", name: "Level 2.5" },
  { level: "l35", name: "Level 3.5" },
] as const;

type Level = (typeof LEVELS)[number]["level"];

export interface Picture {
  /** Its file name's stem, such as a001. */
  readonly name: string;
  /** Its group's letter (groups.ts). */
  readonly group: string;
  /** What it is, with its attribution. */
  readonly caption: string;
  /** Its TTI at each level converted, in LEVELS's order. */
  readonly levels: readonly { readonly level: Level; readonly tti: string }[];
}
