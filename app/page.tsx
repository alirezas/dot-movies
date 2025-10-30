import { desc, isNotNull, isNull } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema/movies";
import { MovieCard } from "./components/movie-card";
import { QuickFilterLinks } from "./components/quick-filter-links";

export default async function MoviesPage() {
  // Get all movies and separate counts
  const [allMovies, watchedCount, watchlistCount] = await Promise.all([
    db
      .select()
      .from(movies)
      .orderBy(desc(movies.releaseYear)), // Show newest added first
    db
      .select({ count: movies.id })
      .from(movies)
      .where(isNotNull(movies.watchedDate)),
    db
      .select({ count: movies.id })
      .from(movies)
      .where(isNull(movies.watchedDate)),
  ]);

  const totalWatched = watchedCount.length;
  const totalWatchlist = watchlistCount.length;
  const totalMovies = allMovies.length;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            All Movies
          </h1>
          <div className="mt-2 flex gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <span>{totalMovies} total movies</span>
            <span>•</span>
            <span>{totalWatched} watched</span>
            <span>•</span>
            <span>{totalWatchlist} in watchlist</span>
          </div>
        </div>
      </div>

      {/* Quick filter links */}
      <QuickFilterLinks currentPath="/" />

      {allMovies.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          {allMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={{
                ...movie,
                watchedDate: movie.watchedDate
                  ? new Date(movie.watchedDate).toISOString()
                  : null,
              }}
            />
          ))}
        </div>
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
    </main>
  );
}
