"use client";

import { MARK_TONE, MARKS, toggleMark, useMarks, type Mark } from "@/lib/marks";

const ICONS: Record<Mark, React.ReactNode> = {
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  buy: (
    <>
      <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  bought: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

function Icon({ mark, filled }: { mark: Mark; filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5"
      fill={filled && mark === "star" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[mark]}
    </svg>
  );
}

/**
 * Interested / want to buy / bought. `compact` is a column of icon buttons for list rows;
 * otherwise labelled buttons for the game page.
 */
export function MarkControl({ id, title, compact }: { id: string; title: string; compact?: boolean }) {
  const current = useMarks()[id];
  return (
    <div role="group" aria-label={`Mark ${title}`} className={compact ? "flex flex-col gap-1" : "flex flex-wrap gap-2"}>
      {MARKS.map((m) => {
        const on = current === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => toggleMark(id, m.id)}
            aria-pressed={on}
            aria-label={compact ? m.label : undefined}
            title={m.label}
            className={`flex items-center justify-center gap-1.5 rounded-md transition-colors ${
              compact ? "h-9 w-9" : "border border-black/10 px-3 py-2 text-sm font-medium dark:border-white/15"
            } ${
              on
                ? `${MARK_TONE[m.id].active} ${compact ? "" : "border-transparent"}`
                : "text-neutral-400 hover:bg-black/[0.04] hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-200"
            }`}
          >
            <Icon mark={m.id} filled={on} />
            {compact ? null : m.label}
          </button>
        );
      })}
    </div>
  );
}

/** A coloured edge on a list row you've marked, so your picks stand out while scrolling. */
export function MarkStripe({ id }: { id: string }) {
  const mark = useMarks()[id];
  if (!mark) return null;
  return <span aria-hidden className={`absolute -left-3 top-4 bottom-4 w-1 rounded-full ${MARK_TONE[mark].stripe}`} />;
}
