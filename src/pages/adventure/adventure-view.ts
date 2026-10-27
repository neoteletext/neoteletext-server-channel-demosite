// An adventure as it is played: the room's picture and name, what was
// last said, and a line to type commands on.

import { Colour } from "neottx-server-ts-protocol";
import { type Child, Columns, Component, DoubleHeight, Gap, h, Mosaic, Paragraph, Rows, Text, TextField } from "neottx-server-ts-ui-components";
import { act, type Adventure, begin } from "./play.ts";
import type { World } from "./world.ts";

/** The longest command taken. */
const LONGEST_COMMAND = 30;
/** The picture's cells across: its sixels, two to a cell, and its colour's cell. */
const ART_CELLS = 9;
/** The most lines of what was said. */
const SAID_LINES = 9;

export class AdventureView extends Component<{ readonly world: World }, Adventure> {
  override state: Adventure = begin(this.props.world);

  override render(): Child {
    const { world } = this.props;
    const room = world.rooms[this.state.room];
    return [
      h(
        Columns,
        { key: "room", widths: [ART_CELLS, null] },
        h(Mosaic, { bitmap: room?.art ?? [], foreground: Colour.Yellow }),
        h(
          Rows,
          {},
          h(DoubleHeight, { text: room?.name ?? "", foreground: Colour.Cyan }),
          h(Text, { text: `Carrying: ${this.state.carrying.join(", ") || "nothing"}`, foreground: Colour.Green }),
        ),
      ),
      h(Gap, { key: "gap" }),
      h(Paragraph, { key: "said", text: this.state.said, lines: SAID_LINES, foreground: this.state.won ? Colour.Yellow : Colour.White }),
      h(Gap, { key: "gap2" }),
      this.state.won
        ? h(Text, { key: "won", text: "The end. Leave the page to play again.", foreground: Colour.Magenta })
        : h(TextField, {
            key: "command",
            longest: LONGEST_COMMAND,
            placeholder: "what now?",
            autoFocus: true,
            onSubmit: (typed: string) => {
              this.setState(act(world, this.state, typed));
            },
          }),
    ];
  }
}
