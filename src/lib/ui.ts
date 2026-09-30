/** A white card with a soft shadow on the grey page; in dark mode a step up from the page with a faint edge. */
export const CARD =
  "rounded-xl bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04),0_2px_8px_rgb(0_0_0/0.05)] dark:bg-neutral-900 dark:shadow-none dark:ring-1 dark:ring-white/[0.06]";

/** The same card, sitting lower: a faint contact shadow only, for supporting content beside a CARD. */
export const CARD_QUIET =
  "rounded-xl bg-white/60 shadow-[0_1px_2px_rgb(0_0_0/0.03)] dark:bg-neutral-900/50 dark:ring-1 dark:ring-white/[0.04]";

/** The main card on a page: the same, lifted higher with a deeper shadow. */
export const CARD_RAISED =
  "rounded-xl bg-white shadow-[0_1px_3px_rgb(0_0_0/0.06),0_10px_30px_-4px_rgb(0_0_0/0.12)] dark:bg-neutral-900 dark:shadow-[0_10px_30px_-4px_rgb(0_0_0/0.6)] dark:ring-1 dark:ring-white/[0.08]";
