// What the server refused of what the channel sent, written to the server's
// log for a person to see (typescript.md TS-25): the path of the first
// fault, the rule broken and the detail. The library's pages send sounds,
// and every rule of a sound the schema cannot state is the server's.

import type { Application } from "neoteletext-server-ts-protocol";

/** An application with no pages of its own that hears every refusal. */
export const REFUSALS: Application = {
  pages: () => [],
  start: () => {
    // It publishes nothing.
  },
  refused: (refusal, context) => {
    context.log(`refused ${refusal.message ?? "a line"} at ${refusal.path === "" ? "the message" : refusal.path}: ${refusal.rule}: ${refusal.detail}`);
  },
};
