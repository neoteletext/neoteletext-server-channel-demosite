// The radio: its tunes to choose from, each played as a live stream, and
// the library's player, which shows what plays and works it.

import { Colour } from "neoteletext-server-ts-protocol";
import { AudioPlayer, type Child, ChoiceList, Component, Gap, h, Text } from "neoteletext-server-ts-ui-components";
import { type Track, TRACKS } from "./tunes.ts";

export class Radio extends Component {
  override render(): Child {
    return [
      h(Text, { key: "label", text: "Choose a tune, Enter plays it", foreground: Colour.Cyan }),
      h(ChoiceList<Track>, {
        key: "tunes",
        items: TRACKS,
        text: (track: Track) => track.name,
        shown: TRACKS.length,
        autoFocus: true,
        onChoose: (index: number, session: number) => {
          const track = TRACKS[index];
          if (track !== undefined) {
            this.services.stream(track.source(), session);
          }
        },
      }),
      h(Gap, { key: "gap" }),
      h(AudioPlayer, { key: "player", foreground: Colour.Yellow }),
    ];
  }
}
