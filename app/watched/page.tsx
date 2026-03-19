import { MovieCardSkeletonGrid } from "@/components/movie-card-skeleton";
import {
  getMovieCounts,
  getWatchedMoviesPaginated,
} from "@/lib/queries/movies";
import { toMovieCardData } from "@/lib/types";
import Link from "next/link";
import { Suspense } from "react";
import { InfiniteMovieList } from "../../components/infinite-movie-list";

async function WatchedCount() {
  const counts = await getMovieCounts();
  return (
    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
      {counts.watched} movies watched
    </p>
  );
}

const INITIAL_LIMIT = 24;

async function WatchedMoviesContent() {
  const initialMovies = await getWatchedMoviesPaginated(0, INITIAL_LIMIT);

  return (
    <>
      {initialMovies.length > 0 ? (
        <InfiniteMovieList
          initialMovies={initialMovies.map(toMovieCardData)}
          initialHasMore={initialMovies.length >= INITIAL_LIMIT}
          fetchParams="watched=true"
        />
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
    <main className="px-6 py-8">
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

      <Suspense fallback={<MovieCardSkeletonGrid count={24} />}>
        <WatchedMoviesContent />
      </Suspense>
    </main>
  );
}
