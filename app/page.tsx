import { getMovieCounts, getMoviesPaginated } from "@/lib/queries/movies";
import { toMovieCardData } from "@/lib/types";
import Link from "next/link";
import { Suspense } from "react";
import { InfiniteMovieList } from "../components/infinite-movie-list";
import { QuickFilterLinks } from "../components/quick-filter-links";

async function MovieCounts() {
  const counts = await getMovieCounts();
  return (
    <div className="mt-2 flex gap-4 text-sm text-neutral-600 dark:text-neutral-400">
      <span>{counts.total} total movies</span>
      <span>•</span>
      <span>{counts.watched} watched</span>
      <span>•</span>
      <span>{counts.watchlist} in watchlist</span>
    </div>
  );
}

async function MoviesContent() {
  const [counts, initialMovies] = await Promise.all([
    getMovieCounts(),
    getMoviesPaginated(0, 20),
  ]);

  return (
    <>
      <QuickFilterLinks currentPath="/" counts={counts} />
      {initialMovies.length > 0 ? (
        <InfiniteMovieList initialMovies={initialMovies.map(toMovieCardData)} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            No movies yet
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            Start adding movies to your collection
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

export default function MoviesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            All Movies
          </h1>
          <Suspense
            fallback={
              <div className="mt-2 flex gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <span>Loading...</span>
              </div>
            }
          >
            <MovieCounts />
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
        <MoviesContent />
      </Suspense>
    </main>
  );
}
