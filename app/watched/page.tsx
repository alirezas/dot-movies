import {
  getMovieCounts,
  getWatchedMoviesPaginated,
} from "@/lib/queries/movies";
import Link from "next/link";
import { Suspense } from "react";
import { QuickFilterLinks } from "../../components/quick-filter-links";
import { WatchedMoviesList } from "../../components/watched-movies-list";

async function WatchedCount() {
  const counts = await getMovieCounts();
  return (
    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
      {counts.watched} movies watched
    </p>
  );
}

async function WatchedMoviesContent() {
  const [counts, initialMovies] = await Promise.all([
    getMovieCounts(),
    getWatchedMoviesPaginated(0, 20),
  ]);

  return (
    <>
      <QuickFilterLinks currentPath="/watched" counts={counts} />
      {initialMovies.length > 0 ? (
        <WatchedMoviesList initialMovies={initialMovies} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            No watched movies yet
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            Start watching movies and they'll appear here
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Go to Home
          </Link>
        </div>
      )}
    </>
  );
}

export default function WatchedPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Watched Movies
          </h1>
          <Suspense
            fallback={
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                Loading...
              </p>
            }
          >
            <WatchedCount />
          </Suspense>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <div className="text-neutral-600 dark:text-neutral-400">
              Loading movies...
            </div>
          </div>
        }
      >
        <WatchedMoviesContent />
      </Suspense>
    </main>
  );
}
