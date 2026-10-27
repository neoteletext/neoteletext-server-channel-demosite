// A file read only when it is no larger than it should be.

import { readFileSync, statSync } from "node:fs";

/** The file at `path` as text, or undefined when it is missing, not a file or larger than `longest` bytes. */
export function readSmall(path: string, encoding: "utf8" | "latin1", longest: number): string | undefined {
  try {
    const stats = statSync(path);
    if (!stats.isFile() || stats.size > longest) {
      return undefined;
    }
    return readFileSync(path, encoding);
  } catch {
    return undefined;
  }
}
