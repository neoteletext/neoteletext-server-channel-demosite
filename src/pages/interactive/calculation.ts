// A pocket calculator's arithmetic: what each key does to what it holds.

type Operator = "+" | "-" | "*" | "/";

export interface Calculation {
  /** What the display shows. */
  readonly display: string;
  /** The number before the operator, and the operator, while one waits. */
  readonly held: number | null;
  readonly operator: Operator | null;
  /** The next digit starts a new number. */
  readonly fresh: boolean;
}

export const CLEAR: Calculation = { display: "0", held: null, operator: null, fresh: true };

/** The most digits the display takes. */
const MOST_DIGITS = 12;
/** Significant figures a result is shown to, so 0.1 + 0.2 shows as 0.3. */
const FIGURES = 10;

const OPERATIONS: Readonly<Record<Operator, (held: number, value: number) => number>> = {
  "+": (held, value) => held + value,
  "-": (held, value) => held - value,
  "*": (held, value) => held * value,
  "/": (held, value) => held / value,
};

function apply(held: number, operator: Operator, value: number): number {
  return OPERATIONS[operator](held, value);
}

function shown(value: number): string {
  if (!Number.isFinite(value)) {
    return "Error";
  }
  const text = String(Number(value.toPrecision(FIGURES)));
  return text.length > MOST_DIGITS ? value.toExponential(MOST_DIGITS / 2) : text;
}

/** The result of what waits, or the display's number when nothing does. */
function settled(state: Calculation): number {
  const value = Number(state.display);
  return state.held === null || state.operator === null || state.fresh ? value : apply(state.held, state.operator, value);
}

/** `state` after `key`: a digit, a point, an operator, = or C. */
export function press(state: Calculation, key: string): Calculation {
  if (key === "C") {
    return CLEAR;
  }
  if (/^[0-9]$/u.test(key)) {
    if (state.fresh || state.display === "0") {
      return { ...state, display: key, fresh: false };
    }
    return state.display.length >= MOST_DIGITS ? state : { ...state, display: state.display + key };
  }
  if (key === ".") {
    if (state.fresh) {
      return { ...state, display: "0.", fresh: false };
    }
    return state.display.includes(".") ? state : { ...state, display: `${state.display}.` };
  }
  if (key === "=") {
    return { display: shown(settled(state)), held: null, operator: null, fresh: true };
  }
  if (key === "+" || key === "-" || key === "*" || key === "/") {
    const value = settled(state);
    return { display: shown(value), held: value, operator: key, fresh: true };
  }
  return state;
}
