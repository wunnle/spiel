"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A game's description. On desktop it fills whatever height its card has left and "Read more" opens
 * the whole text in a dialog; on phones (no height to fill) it shows six lines and expands in place.
 * The button only appears when something is actually cut off.
 */
export function ReadMore({ paragraphs, title }: { paragraphs: string[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [cut, setCut] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  // Is any of it hidden? Re-checked whenever the box changes size.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setCut(el.scrollHeight > el.clientHeight + 1));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function more() {
    // Same width as Tailwind's lg breakpoint (globals.css), where the card has height to fill.
    if (matchMedia("(min-width: 56rem)").matches) dialog.current?.showModal();
    else setOpen((v) => !v);
  }

  const text = paragraphs.map((p, i) => <p key={i}>{p}</p>);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative lg:min-h-28 lg:flex-1">
        <div
          ref={box}
          className={`space-y-3 lg:absolute lg:inset-0 lg:overflow-hidden ${open ? "" : "line-clamp-6 lg:line-clamp-none"} ${
            cut && !open ? "[mask-image:linear-gradient(to_bottom,black_70%,transparent)]" : ""
          }`}
        >
          {text}
        </div>
      </div>
      {cut || open ? (
        <button
          type="button"
          onClick={more}
          aria-expanded={open}
          className="mt-2 self-start text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-orange-600 hover:decoration-orange-600 dark:text-neutral-400 dark:decoration-neutral-600 dark:hover:text-orange-400 dark:hover:decoration-orange-400"
        >
          {open ? "Show less" : "Read more"}
        </button>
      ) : null}

      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="m-auto max-h-[85vh] w-[min(40rem,calc(100vw-2rem))] rounded-xl bg-white p-0 text-neutral-800 backdrop:bg-black/50 dark:bg-neutral-900 dark:text-neutral-200"
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-6 py-4 dark:border-white/[0.08]">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{title}</h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close"
            className="-mr-2 rounded-md p-1 text-neutral-500 hover:bg-black/[0.05] dark:text-neutral-400 dark:hover:bg-white/[0.08]"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto px-6 py-5 leading-relaxed text-neutral-700 dark:text-neutral-300">{text}</div>
      </dialog>
    </div>
  );
}
