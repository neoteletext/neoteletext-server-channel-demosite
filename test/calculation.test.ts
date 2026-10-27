// The calculator's arithmetic, key by key.

import assert from "node:assert/strict";
import { test } from "node:test";

import { type Calculation, CLEAR, press } from "../src/pages/interactive/calculation.ts";

/** The display after pressing each of `keys` in turn from a clear calculator. */
function displayAfter(keys: string): string {
  let state: Calculation = CLEAR;
  for (let index = 0; index < keys.length; index += 1) {
    state = press(state, keys.charAt(index));
  }
  return state.display;
}

test("the calculator does sums, keeps an operator waiting and refuses to divide by nought", () => {
  assert.equal(displayAfter("12+30="), "42");
  assert.equal(displayAfter("2+3*4="), "20");
  assert.equal(displayAfter("0.1+0.2="), "0.3");
  assert.equal(displayAfter("7/0="), "Error");
  assert.equal(displayAfter("5C"), "0");
});
