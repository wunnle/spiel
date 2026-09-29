"use client";

import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";

type Group = { key: "star" | "buy"; label: string; ids: string[] };

/**
 * The SPIEL app's "Import favourites" scans the same QR code the official novelties page shows:
 * {"prj":"spiel26","prd":[product ids]}. You pick which of your lists go across.
 */
export function TransferDialog({
  interested,
  wantToBuy,
  skipped,
  onClose,
}: {
  interested: string[];
  wantToBuy: string[];
  skipped: number;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const groups: Group[] = [
    { key: "star", label: "Interested", ids: interested },
    { key: "buy", label: "Want to buy", ids: wantToBuy },
  ];
  const [picked, setPicked] = useState({ star: interested.length > 0, buy: wantToBuy.length > 0 });
  const [qr, setQr] = useState<string>();

  const ids = useMemo(
    () => [...(picked.star ? interested : []), ...(picked.buy ? wantToBuy : [])],
    [picked, interested, wantToBuy],
  );

  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
  }, []);

  useEffect(() => {
    if (!ids.length) return;
    QRCode.toDataURL(JSON.stringify({ prj: "spiel26", prd: ids }), { margin: 2, width: 640, errorCorrectionLevel: "L" })
      .then(setQr)
      .catch(() => setQr(undefined));
  }, [ids]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(26rem,calc(100vw-2rem))] overflow-y-auto rounded-xl bg-white p-6 text-neutral-800 backdrop:bg-black/50 dark:bg-neutral-900 dark:text-neutral-200"
    >
      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Send to the SPIEL app</h2>
      <p className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-300">
        Pick what to send, then scan the code with <strong>Import favourites</strong> in the SPIEL 2026 app.
        The games are added to your favourites there.
      </p>

      <fieldset className="mt-4 space-y-2">
        <legend className="sr-only">Lists to send</legend>
        {groups.map((g) => (
          <label
            key={g.key}
            className={`flex items-center gap-3 rounded-lg border border-black/10 px-3 py-2 dark:border-white/15 ${
              g.ids.length ? "cursor-pointer" : "opacity-50"
            }`}
          >
            <input
              type="checkbox"
              checked={picked[g.key]}
              disabled={!g.ids.length}
              onChange={(e) => setPicked((p) => ({ ...p, [g.key]: e.target.checked }))}
              className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
            />
            <span className="flex-1 font-medium">{g.label}</span>
            <span className="tabular-nums text-neutral-500 dark:text-neutral-400">{g.ids.length}</span>
          </label>
        ))}
      </fieldset>

      <div className="mt-4 flex aspect-square items-center justify-center rounded-lg bg-white p-2">
        {ids.length && qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt={`QR code with ${ids.length} ${ids.length === 1 ? "game" : "games"}`} className="h-full w-full" />
        ) : (
          <p className="px-6 text-center text-neutral-500">Tick at least one list to get a code.</p>
        )}
      </div>
      {ids.length ? (
        <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {ids.length} {ids.length === 1 ? "game" : "games"}
        </p>
      ) : null}
      {skipped ? (
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          {skipped} marked {skipped === 1 ? "game isn't" : "games aren't"} in the official list yet, so{" "}
          {skipped === 1 ? "it" : "they"} can&apos;t go across.
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => ref.current?.close()}
        className="mt-5 w-full rounded-lg border border-black/10 py-2 font-medium dark:border-white/15"
      >
        Done
      </button>
    </dialog>
  );
}
