// A text adventure's play: what each command does to where the player is
// and what they carry. Commands are a verb and perhaps a word after it,
// such as "go north", "n", "take key", "look", "inventory".

import { DIRECTIONS, type Direction, type Room, type World } from "./world.ts";

export interface Adventure {
  readonly room: string;
  readonly carrying: readonly string[];
  /** The things moved from where they started: by room, what lies there now. */
  readonly lying: Readonly<Record<string, readonly string[]>>;
  /** What was last said. */
  readonly said: string;
  readonly won: boolean;
}

const HELP = "Try: n s e w up down, look, take THING, drop THING, inventory.";

export function begin(world: World): Adventure {
  const lying = Object.fromEntries(Object.entries(world.rooms).map(([id, room]) => [id, room.things ?? []]));
  return { room: world.start, carrying: [], lying, said: `${world.title}. ${HELP}`, won: false };
}

function roomOf(world: World, state: Adventure): Room | undefined {
  return world.rooms[state.room];
}

/** What is said of the room: its description and what lies there. */
function describe(world: World, state: Adventure): string {
  const room = roomOf(world, state);
  if (room === undefined) {
    return "";
  }
  const things = state.lying[state.room] ?? [];
  const exits = Object.keys(room.exits).join(", ");
  return `${room.description}${things.length > 0 ? ` You see: ${things.join(", ")}.` : ""} Exits: ${exits}.`;
}

function directionOf(word: string): Direction | undefined {
  return DIRECTIONS.find((direction) => direction === word || direction.charAt(0) === word);
}

function go(world: World, state: Adventure, direction: Direction): Adventure {
  const room = roomOf(world, state);
  const to = room?.exits[direction];
  if (room === undefined || to === undefined) {
    return { ...state, said: "You can't go that way." };
  }
  if (room.locked?.direction === direction && !state.carrying.includes(room.locked.needs)) {
    return { ...state, said: room.locked.refusal };
  }
  const moved = { ...state, room: to };
  const won = to === world.goal.room && state.carrying.includes(world.goal.thing);
  return { ...moved, won, said: won ? world.goal.won : describe(world, moved) };
}

function take(state: Adventure, thing: string): Adventure {
  const here = state.lying[state.room] ?? [];
  if (!here.includes(thing)) {
    return { ...state, said: thing === "" ? "Take what?" : `There is no ${thing} here.` };
  }
  return {
    ...state,
    carrying: [...state.carrying, thing],
    lying: { ...state.lying, [state.room]: here.filter((each) => each !== thing) },
    said: `You take the ${thing}.`,
  };
}

function drop(state: Adventure, thing: string): Adventure {
  if (!state.carrying.includes(thing)) {
    return { ...state, said: thing === "" ? "Drop what?" : `You have no ${thing}.` };
  }
  return {
    ...state,
    carrying: state.carrying.filter((each) => each !== thing),
    lying: { ...state.lying, [state.room]: [...(state.lying[state.room] ?? []), thing] },
    said: `You drop the ${thing}.`,
  };
}

/** `state` after the command `typed`. */
export function act(world: World, state: Adventure, typed: string): Adventure {
  if (state.won) {
    return state;
  }
  const [verb = "", ...rest] = typed.trim().toLowerCase().split(/\s+/u);
  const object = rest.filter((word) => word !== "the").join(" ");
  const direction = directionOf(verb === "go" ? object : verb);
  if (direction !== undefined && (verb === "go" || object === "")) {
    return go(world, state, direction);
  }
  switch (verb) {
    case "look":
    case "l": {
      return { ...state, said: describe(world, state) };
    }
    case "take":
    case "get": {
      return take(state, object);
    }
    case "drop": {
      return drop(state, object);
    }
    case "inventory":
    case "i": {
      return { ...state, said: state.carrying.length === 0 ? "You carry nothing." : `You carry: ${state.carrying.join(", ")}.` };
    }
    default: {
      return { ...state, said: `I don't understand. ${HELP}` };
    }
  }
}
