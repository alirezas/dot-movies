"use client";

import { BookmarkCheck, Eye, Film, Upload } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "All Movies", icon: Film },
  { href: "/watched", label: "Watched", icon: Eye },
  { href: "/watchlist", label: "Watchlist", icon: BookmarkCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground z-40">
      <div className="p-5">
        <Link href="/" className="text font-light uppercase">
          Dot Movies
        </Link>
        <p className="mt-1 text-xs text-sidebar-foreground/40">
          v{process.env.APP_VERSION}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {process.env.NODE_ENV === "development" && (
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/dev/import"
            className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <Upload className="size-3.5" />
            Import
          </Link>
        </div>
      )}
    </aside>
  );
}
