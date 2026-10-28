// A calculator: its display in large digits and a keypad of buttons; the
// digits and + - * / = . on the keyboard work as well.

import { Colour, Key } from "neoteletext-server-ts-protocol";
import { BigDigits, Button, type Child, Component, Grid, h, type KeyEvent, type PageNeeds, Text, typedText } from "neoteletext-server-ts-ui-components";
import { type Calculation, CLEAR, press } from "./calculation.ts";

const KEYPAD = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+", "C"] as const;
const KEYPAD_COLUMNS = 4;
/** A key's width in cells. */
const KEY_CELLS = 7;
/** The large digits fit this many characters across the page. */
const DISPLAY_CHARACTERS = 9;

export class Calculator extends Component<object, Calculation> {
  override state: Calculation = CLEAR;

  override focusable(): boolean {
    return true;
  }

  override needs(): PageNeeds {
    return { digits: true, ownCopy: true };
  }

  override hint(): string {
    return "Type a sum, or click the keys; Enter is =";
  }

  #press(key: string): void {
    this.setState(press(this.state, key));
  }

  override onKey(event: KeyEvent): boolean {
    if (event.action === "release") {
      return false;
    }
    if (event.key === Key.Enter) {
      this.#press("=");
      return true;
    }
    if (event.key === Key.Backspace || event.key === Key.Escape) {
      this.#press("C");
      return true;
    }
    const typed = typedText(event);
    if (typed !== undefined && (KEYPAD as readonly string[]).includes(typed.toUpperCase())) {
      this.#press(typed.toUpperCase());
      return true;
    }
    return false;
  }

  override render(): Child {
    const { display } = this.state;
    const big = display.length <= DISPLAY_CHARACTERS;
    return [
      big ? h(BigDigits, { key: "display", text: display, foreground: Colour.Yellow }) : h(Text, { key: "display", text: display, foreground: Colour.Yellow }),
      h(Text, { key: "waiting", text: this.state.operator === null ? "" : `${this.state.held ?? ""} ${this.state.operator}`, foreground: Colour.Cyan }),
      h(
        Grid,
        { key: "keypad", columns: KEYPAD_COLUMNS },
        ...KEYPAD.map((key) =>
          h(Button, {
            key,
            label: key,
            width: KEY_CELLS,
            background: /[0-9.]/u.test(key) ? Colour.Blue : Colour.Magenta,
            onPress: () => {
              this.#press(key);
            },
          }),
        ),
      ),
    ];
  }
}
