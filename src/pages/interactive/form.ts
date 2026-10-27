// A form in steps, each a few of the library's controls: a viewer's name
// and where they watch, what they read, how they read, then what they said.

import { Colour } from "neottx-server-ts-protocol";
import { type Child, Component, h, Notice, Paragraph, Rows, Table, Wizard } from "neottx-server-ts-ui-components";
import { type FormAnswers, LABEL_CELLS, summaryOf } from "./form-answers.ts";
import { PagesStep } from "./pages-step.ts";
import { ReadingStep } from "./reading-step.ts";
import { YouStep } from "./you-step.ts";

/** Pages a day, to begin with. */
const START_PAGES = 20;
const STEPS = ["You", "Reading", "Pages", "Send"] as const;
const NAME_STEP = 0;

interface FormState {
  readonly answers: FormAnswers;
  readonly sent: boolean;
}

export class SignUpForm extends Component<object, FormState> {
  override state: FormState = { answers: { name: "", region: 0, reads: [], service: 0, pages: START_PAGES, subtitles: false }, sent: false };

  readonly #change = (change: Partial<FormAnswers>): void => {
    this.setState({ answers: { ...this.state.answers, ...change } });
  };

  override render(): Child {
    const { answers, sent } = this.state;
    const summary = h(Table, { key: "summary", rows: summaryOf(answers), labelCells: LABEL_CELLS });
    if (sent) {
      return [h(Notice, { key: "thanks", kind: "success", text: `Thank you, ${answers.name}` }), summary];
    }
    const step = { answers, onChange: this.#change };
    return h(
      Wizard,
      {
        steps: STEPS,
        ready: (at: number) => (at === NAME_STEP && answers.name.trim() === "" ? "Type your name first" : null),
        onFinish: () => {
          this.setState({ sent: true });
        },
      },
      h(YouStep, { key: "you", ...step }),
      h(ReadingStep, { key: "reading", ...step }),
      h(PagesStep, { key: "pages", ...step }),
      h(Rows, { key: "send" }, h(Paragraph, { text: "Press Finish to send this:", foreground: Colour.Cyan }), summary),
    );
  }
}
