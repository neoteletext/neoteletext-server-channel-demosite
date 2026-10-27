// The groups captions.tsv puts the pictures in, by their letters.

export const GROUPS = [
  { letter: "a", name: "Animals" },
  { letter: "p", name: "People" },
  { letter: "t", name: "Travel" },
  { letter: "c", name: "Characters" },
  { letter: "g", name: "Game art" },
  { letter: "s", name: "Sprites" },
  { letter: "e", name: "Examples" },
] as const;

/** Whether `letter` names a group. */
export function isGroup(letter: string): boolean {
  return GROUPS.some((group) => group.letter === letter);
}
