import { notFound } from "next/navigation";
import Link from "next/link";

export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="px-6 py-8 flex flex-col gap-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          &larr; Back to app
        </Link>
        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          DEV
        </span>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {children}
      </div>
    </div>
  );
}
