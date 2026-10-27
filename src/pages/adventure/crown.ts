// The Crown: a castle, a key in the cellar, and the crown to put back on
// its throne.

import type { World } from "./world.ts";

export const CROWN: World = {
  title: "The Crown",
  start: "gate",
  goal: { room: "throne", thing: "crown", won: "You set the crown upon the throne. The bells ring out across the land. You win!" },
  rooms: {
    gate: {
      name: "Castle gate",
      description: "The castle gate stands open. Banners hang limp.",
      art: ["#.#.#....#.#.#", "#####....#####", "#...######...#", "#...#....#...#", "#...#....#...#", "#####....#####"],
      exits: { north: "hall" },
    },
    hall: {
      name: "Great hall",
      description: "A great hall, its tables bare. Stairs go down; a door leads east.",
      art: ["......##......", ".....####.....", "....######....", "##############", "#.##.#..#.##.#", "#.##.#..#.##.#"],
      exits: { south: "gate", east: "vault", down: "cellar", north: "throne" },
      locked: { direction: "east", needs: "key", refusal: "The vault door is locked fast." },
    },
    cellar: {
      name: "Cellar",
      description: "Barrels, cobwebs and the smell of old wine.",
      art: ["..####..####..", ".#....##....#.", ".#....##....#.", ".#....##....#.", "..####..####..", "##############"],
      exits: { up: "hall" },
      things: ["key"],
    },
    vault: {
      name: "Vault",
      description: "Bare shelves, but for one velvet cushion.",
      art: ["....#.##.#....", "....######....", "....######....", "..##########..", "..#........#..", "..##########.."],
      exits: { west: "hall" },
      things: ["crown"],
    },
    throne: {
      name: "Throne room",
      description: "An empty throne beneath a high window.",
      art: ["....######....", "....#....#....", "....#....#....", "..##########..", "..#........#..", "..#........#.."],
      exits: { south: "hall" },
    },
  },
};
