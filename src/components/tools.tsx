"use client";

import { lazy, Suspense, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMarks } from "@/lib/marks";
import { SaveOffline, TOOL_BUTTON, ToolRow } from "./offline";

// The QR library only loads when the dialog opens.
const TransferDialog = lazy(() => import("./transfer-dialog").then((m) => ({ default: m.TransferDialog })));

export function QrIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
      <path d="M14.5 14.5h2.5v2.5M20.5 14.5v0M14.5 20.5h2.5M20.5 18v2.5h-1" />
    </svg>
  );
}

function SendToApp() {
  const marks = useMarks();
  const [open, setOpen] = useState(false);

  // What the SPIEL app can take: games still to find, with an official id (shortlist-only ones are "pick:…").
  const lists = useMemo(() => {
    const of = (m: string) => Object.entries(marks).flatMap(([id, v]) => (v === m && !id.startsWith("pick:") ? [id] : []));
    return {
      interested: of("star"),
      wantToBuy: of("buy"),
      skipped: Object.entries(marks).filter(([id, v]) => v !== "bought" && id.startsWith("pick:")).length,
    };
  }, [marks]);
  const canSend = lists.interested.length + lists.wantToBuy.length > 0;

  return (
    <>
      <ToolRow
        icon={<QrIcon className="h-5 w-5" />}
        title="Send to the SPIEL app"
        note={
          canSend
            ? "A QR code for the official app's Import favourites, with your Interested and/or Want to buy games."
            : "Mark some games as Interested or Want to buy first."
        }
        action={
          <button type="button" disabled={!canSend} onClick={() => setOpen(true)} className={TOOL_BUTTON}>
            Show QR
          </button>
        }
      />
      {/* At page level, so the dialog outlives the account menu it's opened from. */}
      {open
        ? createPortal(
            <Suspense fallback={null}>
              <TransferDialog
                interested={lists.interested}
                wantToBuy={lists.wantToBuy}
                skipped={lists.skipped}
                onClose={() => setOpen(false)}
              />
            </Suspense>,
            document.body,
          )
        : null}
    </>
  );
}

/** The occasional tools, kept in the account menu out of the way of browsing. */
export function Tools() {
  return (
    <div className="divide-y divide-black/5 dark:divide-white/10">
      <SendToApp />
      <SaveOffline />
    </div>
  );
}
