"use client";

import { BookmarkCheck, Eye, Film } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ImportDialogTrigger =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
        import("./dev/import-dialog-trigger").then(
          (m) => m.ImportDialogTrigger
        )
      )
    : null;

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

      <div className="border-t border-sidebar-border p-3">
        {ImportDialogTrigger && <ImportDialogTrigger />}
        <p className="mt-2 text-xs text-sidebar-foreground/40">
          v{process.env.APP_VERSION}
        </p>
      </div>
    </aside>
  );
}
