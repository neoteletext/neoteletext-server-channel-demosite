// A pictures folder is untrusted: what fails a check is left out.

import assert from "node:assert/strict";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { loadPictures } from "../src/pictures/load-pictures.ts";
import { PICTURES } from "./site.ts";

test("a picture whose name is a path, or whose TTI is not seven-bit, is left out", () => {
  const folder = mkdtempSync(join(tmpdir(), "demosite-pictures-"));
  try {
    cpSync(PICTURES, folder, { recursive: true });
    writeFileSync(join(folder, "b001_l15.tti"), "PN,10000\nOL,1,café\n", "latin1");
    writeFileSync(join(folder, "captions.tsv"), ["a001\ta\tThe good one", "../a001\ta\tA path", "b001\ta\tNot seven-bit", "a001\tz\tNo such group"].join("\n"));
    assert.deepEqual(
      loadPictures(folder).map((picture) => [picture.name, picture.caption, picture.levels.length]),
      [["a001", "The good one", 3]],
    );
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
