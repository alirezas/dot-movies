"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const ImportDialogTrigger =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
        import("./dev/import-dialog-trigger").then(
          (m) => m.ImportDialogTrigger
        )
      )
    : null;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-background/80 backdrop-blur-sm dark:border-neutral-800">
      <div className="container mx-auto flex h-12 items-center justify-between px-4">
        <Link
          href="/"
          className="text-sm font-bold text-neutral-900 dark:text-neutral-100"
        >
          dot-movies
        </Link>
        <div className="flex items-center gap-2">
          {ImportDialogTrigger && <ImportDialogTrigger />}
        </div>
      </div>
    </header>
  );
}
