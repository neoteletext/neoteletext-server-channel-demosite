// The form's third step: their service, how much they read, subtitles.

import { type Child, Component, h, Select, Slider, Switch } from "neoteletext-server-ts-ui-components";
import { SERVICES, type StepProps } from "./form-answers.ts";

/** Pages a day: the slider's range and step. */
const MOST_PAGES = 100;
const PAGES_STEP = 5;

export class PagesStep extends Component<StepProps> {
  override render(): Child {
    const { answers, onChange } = this.props;
    return [
      h(Select, {
        key: "service",
        label: "Service",
        items: SERVICES,
        value: answers.service,
        onChange: (service: number) => {
          onChange({ service });
        },
      }),
      h(Slider, {
        key: "pages",
        label: "Pages a day",
        min: 0,
        max: MOST_PAGES,
        step: PAGES_STEP,
        value: answers.pages,
        onChange: (pages: number) => {
          onChange({ pages });
        },
      }),
      h(Switch, {
        key: "subtitles",
        label: "Subtitles",
        value: answers.subtitles,
        onChange: (subtitles: boolean) => {
          onChange({ subtitles });
        },
      }),
    ];
  }
}
