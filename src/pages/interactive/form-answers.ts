// What the sign-up form asks, and its answers as a table's rows.

export const REGIONS = ["North", "South", "East", "West"] as const;
export const READS = ["News", "Weather", "Sport", "TV guide", "Games", "Subtitles"] as const;
export const SERVICES = ["Ceefax", "Oracle", "Teletext Ltd", "4-Tel"] as const;
/** The labels' column of the form's fields and its summary. */
export const LABEL_CELLS = 12;

export interface FormAnswers {
  readonly name: string;
  readonly region: number;
  readonly reads: readonly number[];
  readonly service: number;
  readonly pages: number;
  readonly subtitles: boolean;
}

/** A step's props: the answers so far, and what to tell of a change. */
export interface StepProps {
  readonly answers: FormAnswers;
  readonly onChange: (change: Partial<FormAnswers>) => void;
}

export function summaryOf(answers: FormAnswers): [string, string][] {
  return [
    ["Name", answers.name],
    ["Region", REGIONS[answers.region] ?? ""],
    ["Reads", answers.reads.map((read) => READS[read] ?? "").join(", ") || "nothing"],
    ["Service", SERVICES[answers.service] ?? ""],
    ["Pages", String(answers.pages)],
    ["Subtitles", answers.subtitles ? "on" : "off"],
  ];
}
