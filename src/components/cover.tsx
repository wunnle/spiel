import { coverUrl, type Entry } from "@/lib/entry";

/** Box art, or the title's first letter on a tile when the exhibitor gave no picture. */
export function Cover({ game, size, className }: { game: Entry; size: "sm" | "lg"; className: string }) {
  const src = coverUrl(game, size);
  const box = `overflow-hidden rounded-md bg-black/[0.04] dark:bg-white/[0.06] ${className}`;
  if (!src) {
    return (
      <div aria-hidden className={`${box} flex items-center justify-center text-3xl font-semibold text-neutral-300 dark:text-neutral-600`}>
        {game.title[0]}
      </div>
    );
  }
  return (
    <div className={box}>
      {/* Pre-sized webp from scripts/update.mjs; a static export has no image optimiser to hand this to. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${game.title} box`}
        loading={size === "sm" ? "lazy" : "eager"}
        decoding="async"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
