// The form's second step: what they read.

import { Colour } from "neoteletext-server-ts-protocol";
import { CheckboxGroup, type Child, Component, h, Paragraph } from "neoteletext-server-ts-ui-components";
import { READS, type StepProps } from "./form-answers.ts";

export class ReadingStep extends Component<StepProps> {
  override render(): Child {
    const { answers, onChange } = this.props;
    return [
      h(Paragraph, { key: "what", text: "What do you read?", foreground: Colour.Cyan }),
      h(CheckboxGroup, {
        key: "reads",
        items: READS,
        columns: 2,
        value: answers.reads,
        onChange: (reads: readonly number[]) => {
          onChange({ reads });
        },
      }),
    ];
  }
}
