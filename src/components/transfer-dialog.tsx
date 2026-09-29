"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

/**
 * The SPIEL app's "Import favourites" scans the same QR code the official novelties page shows:
 * {"prj":"spiel26","prd":[product ids]}.
 */
export function TransferDialog({ ids, skipped, onClose }: { ids: string[]; skipped: number; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [qr, setQr] = useState<string>();

  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
    QRCode.toDataURL(JSON.stringify({ prj: "spiel26", prd: ids }), { margin: 2, width: 640, errorCorrectionLevel: "L" })
      .then(setQr)
      .catch(() => setQr(undefined));
  }, [ids]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-xl bg-white p-6 text-neutral-800 backdrop:bg-black/50 dark:bg-neutral-900 dark:text-neutral-200"
    >
      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Send to the SPIEL app</h2>
      <p className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-300">
        In the SPIEL 2026 app, open <strong>Import favourites</strong> and scan this code. Your {ids.length}{" "}
        {ids.length === 1 ? "game" : "games"} marked interested or want-to-buy will be added to your favourites
        there.
      </p>
      <div className="mt-4 flex aspect-square items-center justify-center rounded-lg bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {qr ? <img src={qr} alt="QR code with your marked games" className="h-full w-full" /> : null}
      </div>
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
