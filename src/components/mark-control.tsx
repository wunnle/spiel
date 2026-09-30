"use client";

import { MARK_TONE, MARKS, toggleMark, useMarks, type Mark } from "@/lib/marks";

// Heart: you like the look of it. The bag carries the rest: on your shopping list (+), then yours (✓).
const BAG = (
  <>
    <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </>
);
const ICONS: Record<Mark, React.ReactNode> = {
  star: <path d="M12 20s-7.5-4.6-7.5-10.1A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />,
  buy: (
    <>
      {BAG}
      <path d="M12 11.6v4.8M9.6 14h4.8" />
    </>
  ),
  bought: (
    <>
      {BAG}
      <path d="M9.6 14.1l1.7 1.7 3.2-3.4" />
    </>
  ),
};

function Icon({ mark, filled }: { mark: Mark; filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 shrink-0"
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
export function MarkControl({
  id,
  title,
  compact,
  stretch,
}: {
  id: string;
  title: string;
  compact?: boolean;
  /** Three equal buttons filling the width, as in a card footer. */
  stretch?: boolean;
}) {
  const current = useMarks()[id];
  return (
    <div
      role="group"
      aria-label={`Mark ${title}`}
      className={compact ? "flex flex-col gap-1" : stretch ? "grid grid-cols-3 gap-2" : "flex flex-wrap gap-2"}
    >
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
              compact
                ? "h-9 w-9"
                : `border border-black/10 px-3 py-2 text-sm font-medium dark:border-white/15 ${stretch ? "px-2" : ""}`
            } ${
              on
                ? `${MARK_TONE[m.id].active} ${compact ? "" : "border-transparent"}`
                : `text-neutral-400 hover:bg-black/[0.04] hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-200 ${
                    // On the grey footer, unmarked buttons stay white; a marked one takes its colour.
                    stretch ? "bg-white dark:bg-neutral-900" : ""
                  }`
            }`}
          >
            <Icon mark={m.id} filled={on} />
            {compact ? null : stretch ? (
              <>
                {/* Short labels where three buttons share a phone's width. */}
                <span className="sm:hidden">{m.short}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </>
            ) : (
              m.label
            )}
          </button>
        );
      })}
    </div>
  );
}

