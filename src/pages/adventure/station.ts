// The Station: an empty space station, a keycard, and the way home.

import type { World } from "./world.ts";

export const STATION: World = {
  title: "The Station",
  start: "dock",
  goal: { room: "pod", thing: "keycard", won: "The pod's lights come on as the keycard slides home. You are going home. You win!" },
  rooms: {
    dock: {
      name: "Docking bay",
      description: "You are in a docking bay. Your ship has gone; the station is silent.",
      art: ["..##########..", ".#..........#.", "#..##....##..#", "#..##....##..#", ".#..........#.", "..##########.."],
      exits: { north: "corridor" },
    },
    corridor: {
      name: "Corridor",
      description: "A long corridor curves away. Lights flicker.",
      art: ["#............#", ".#..........#.", "..#..####..#..", "..#..#..#..#..", ".#..........#.", "#............#"],
      exits: { south: "dock", east: "lab", west: "quarters", up: "bridge" },
    },
    lab: {
      name: "Laboratory",
      description: "Benches of broken glass. Something has been here.",
      art: ["...#....#.....", "..###..###....", "..#.#..#.#....", "..###..###....", "##############", "#............#"],
      exits: { west: "corridor" },
      things: ["torch"],
    },
    quarters: {
      name: "Crew quarters",
      description: "Bunks, unmade. A locker hangs open.",
      art: ["##############", "#....#.......#", "######.......#", "#....#..###..#", "######..#.#..#", "#....#..###..#"],
      exits: { east: "corridor" },
      things: ["keycard"],
    },
    bridge: {
      name: "Bridge",
      description: "Stars wheel past the great window. A hatch to the east leads to the escape pod.",
      art: [".#....#....#..", "......#.......", "..#.......#...", "##############", "#..##....##..#", "##############"],
      exits: { east: "pod", down: "corridor" },
      locked: { direction: "east", needs: "keycard", refusal: "The hatch to the pod needs a keycard." },
    },
    pod: {
      name: "Escape pod",
      description: "A seat, a window, a big red button.",
      art: ["....######....", "..##......##..", ".#...####...#.", ".#...####...#.", "..##......##..", "....######...."],
      exits: { west: "bridge" },
    },
  },
};
