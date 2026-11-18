// The demo site's animation pages (animation.md section 11): the channel's
// own pages, written with the protocol kit beside the component library's,
// which writes no rule table. A viewer who opens one is sent its sprites
// and its own rule table in one frame; the table takes the place of the
// channel's default one on that page.

import type { Application, Context, Input, PageEntry } from "neoteletext-server-ts-protocol";

import type { AnimationPage } from "./animation-page.ts";
import { CONTROLS_PAGE } from "./controls.ts";
import { CYCLING_PAGE } from "./cycling.ts";
import { FLASH_PAGE } from "./flash.ts";
import { SPRITES_PAGE } from "./sprites.ts";
import { swapPage } from "./swap.ts";

/** The one sub-page each page has. */
const SUB = 0;

/** One of each page, in the pages' order, with nothing kept for any connection yet. */
export function animationPages(): AnimationPage[] {
  return [FLASH_PAGE, SPRITES_PAGE, CYCLING_PAGE, CONTROLS_PAGE, swapPage()];
}

/** What the menu says of each page. */
export const ANIMATION_LISTED: readonly Pick<AnimationPage, "page" | "title" | "about">[] = animationPages().map(({ page, title, about }) => ({
  page,
  title,
  about,
}));

export class AnimationPages implements Application {
  readonly #pages: readonly AnimationPage[] = animationPages();

  pages(): PageEntry[] {
    return this.#pages.map(({ page, title }) => ({ page, title }));
  }

  start(context: Context): void {
    for (const { page, content } of this.#pages) {
      context.publishSubpages("channel", page, [{ content }]);
    }
  }

  #page(number: number): AnimationPage | undefined {
    return this.#pages.find((candidate) => candidate.page === number);
  }

  opened(connection: number, number: number, context: Context): void {
    const page = this.#page(number);
    if (page === undefined) {
      return;
    }
    page.arrived?.(connection, context);
    const to = { connection };
    // One frame (ANIM-2): the sprites and the table that moves them are in place on one tick.
    context.frame(to, number, SUB, () => {
      context.sprites(to, number, SUB, page.sprites);
      context.rules(to, number, SUB, page.table);
    });
  }

  input(connection: number, number: number, input: Input, context: Context): boolean {
    return this.#page(number)?.input?.(connection, input, context) ?? false;
  }

  leftPage(connection: number, number: number, context: Context): void {
    this.#page(number)?.left?.(connection, context);
  }

  gone(connection: number): void {
    for (const page of this.#pages) {
      page.left?.(connection, null);
    }
  }

  /** A viewer's browser reported a fault of a page's table (page-rules.md RULE-48): logged, since the tables are fixed. */
  readonly rulesFault: NonNullable<Application["rulesFault"]> = (fault, context) => {
    context.log(`a table's fault on page ${fault.page}, connection ${fault.connection}: ${fault.fault}, ${fault.count} times`);
  };
}
