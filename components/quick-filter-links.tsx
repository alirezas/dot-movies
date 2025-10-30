import type { MovieCounts } from "@/lib/queries/movies";
import Link from "next/link";

type QuickFilterLinksProps = {
  currentPath?: string;
  counts: MovieCounts;
};

export function QuickFilterLinks({
  currentPath = "/",
  counts,
}: QuickFilterLinksProps) {
  const {
    total: totalMovies,
    watched: totalWatched,
    watchlist: totalWatchlist,
  } = counts;

  const getLinkClassName = (path: string) => {
    const isActive = currentPath === path;
    return isActive
      ? "rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      : "rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700";
  };

  return (
    <div className="mb-6 flex gap-4">
      <Link href="/" className={getLinkClassName("/")}>
        All ({totalMovies})
      </Link>
      <Link href="/watched" className={getLinkClassName("/watched")}>
        Watched ({totalWatched})
      </Link>
      <Link href="/watchlist" className={getLinkClassName("/watchlist")}>
        Watchlist ({totalWatchlist})
      </Link>
    </div>
  );
}
