// The form's first step: a name, and where they watch.

import { Colour } from "neoteletext-server-ts-protocol";
import { type Child, Component, Field, h, Paragraph, RadioGroup, TextField } from "neoteletext-server-ts-ui-components";
import { LABEL_CELLS, REGIONS, type StepProps } from "./form-answers.ts";

const LONGEST_NAME = 20;

export class YouStep extends Component<StepProps> {
  override render(): Child {
    const { answers, onChange } = this.props;
    return [
      h(
        Field,
        { key: "name", label: "Name", labelCells: LABEL_CELLS, note: "needed" },
        h(TextField, {
          longest: LONGEST_NAME,
          value: answers.name,
          keep: true,
          placeholder: "your name",
          onChange: (name: string) => {
            onChange({ name });
          },
        }),
      ),
      h(Paragraph, { key: "where", text: "Where do you watch?", foreground: Colour.Cyan }),
      h(RadioGroup, {
        key: "region",
        items: REGIONS,
        across: true,
        value: answers.region,
        onChange: (region: number) => {
          onChange({ region });
        },
      }),
    ];
  }
}
