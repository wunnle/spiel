// Card surfaces. In light mode, height reads from shadows; on a dark page shadows barely show, so there
// the ranking is carried by the edge (a 1px border, stronger the higher the card) and a slightly lighter
// surface for the top card.

/** A white card with a soft shadow on the grey page. */
export const CARD =
  "rounded-xl bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04),0_2px_8px_rgb(0_0_0/0.05)] dark:border dark:border-white/[0.09] dark:bg-neutral-900 dark:shadow-none";

/** The same card, sitting lower: a faint contact shadow only, for supporting content beside a CARD. */
export const CARD_QUIET =
  "rounded-xl bg-white/60 shadow-[0_1px_2px_rgb(0_0_0/0.03)] dark:border dark:border-white/[0.06] dark:bg-neutral-900/50 dark:shadow-none";

/** The main card on a page: lifted higher with a deeper shadow; in dark mode the brightest edge and surface. */
export const CARD_RAISED =
  "rounded-xl bg-white shadow-[0_1px_3px_rgb(0_0_0/0.06),0_10px_30px_-4px_rgb(0_0_0/0.12)] dark:border dark:border-white/[0.14] dark:bg-[#1c1c1c] dark:shadow-[0_10px_30px_-4px_rgb(0_0_0/0.6)]";
