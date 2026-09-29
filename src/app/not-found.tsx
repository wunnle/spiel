import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Not here</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300">
        That game may have been renamed or pulled from the list.{" "}
        <Link href="/" className="underline underline-offset-4">
          Browse all games
        </Link>
        .
      </p>
    </div>
  );
}
