"use client";

import { lazy, Suspense, useMemo, useState } from "react";
import { useMarks } from "@/lib/marks";
import { SaveOffline, TOOL_BUTTON, ToolRow } from "./offline";

// The QR library only loads when the dialog opens.
const TransferDialog = lazy(() => import("./transfer-dialog").then((m) => ({ default: m.TransferDialog })));

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
      {open ? (
        <Suspense fallback={null}>
          <TransferDialog
            interested={lists.interested}
            wantToBuy={lists.wantToBuy}
            skipped={lists.skipped}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      ) : null}
    </>
  );
}

/** The footer's handful of occasional tools, kept out of the way of browsing. */
export function Tools() {
  return (
    <section className="max-w-xl">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Tools</h2>
      <div className="mt-1 divide-y divide-black/5 dark:divide-white/10">
        <SaveOffline />
        <SendToApp />
      </div>
    </section>
  );
}
