// What the viewer pages share: a body that is drawn again as the viewer's
// state begins or ends (viewer-state.md VS-401), and the store's limits as
// the pages say them.

import { Component, REMEMBERED_VALUE_IDLE_MS, VISIT_VALUE_IDLE_MS } from "neoteletext-server-ts-ui-components";

/** An hour and a day, in milliseconds. */
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** How long a visit's values are kept after their last use, as the pages say it. */
export const VISIT_KEPT = `${VISIT_VALUE_IDLE_MS / HOUR_MS} hours`;

/** How long a remembered viewer's values are kept after their last use, as the pages say it. */
export const REMEMBERED_KEPT = `${REMEMBERED_VALUE_IDLE_MS / DAY_MS} days`;

/** A page's body that shows the viewer's state: drawn again when it begins or ends on this page's connection. */
export class ViewerAware<Props extends object = object, State extends object = object> extends Component<Props, State> {
  #unsubscribe: (() => void) | null = null;

  override componentDidMount(): void {
    this.#unsubscribe = this.services.bus.on("viewer", ({ connection }) => {
      if (connection === this.services.connection) {
        this.forceUpdate();
      }
    });
  }

  override componentWillUnmount(): void {
    this.#unsubscribe?.();
  }

  /** What the channel knows of this page's viewer: none, a visit, or remembered. Unmounted (the probe of the page's needs), there is no viewer to ask. */
  protected get known(): "none" | "visit" | "remembered" {
    const connection = this.mounted ? this.services.connection : null;
    const viewer = connection === null ? null : this.services.viewer(connection);
    if (viewer === null) {
      return "none";
    }
    return viewer.remembered ? "remembered" : "visit";
  }
}
