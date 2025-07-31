import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema/movies";
import { desc, isNotNull, isNull } from "drizzle-orm";
import Link from "next/link";
import { MovieCard } from "./components/movie-card";

export default async function Home() {
  const [watchedMovies, watchlistMovies, watchedCount, watchlistCount] =
    await Promise.all([
      db
        .select()
        .from(movies)
        .where(isNotNull(movies.watchedDate))
        .orderBy(desc(movies.watchedDate))
        .limit(10),
      db
        .select()
        .from(movies)
        .where(isNull(movies.watchedDate))
        .orderBy(desc(movies.createdAt))
        .limit(10),
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

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        My Movie Diary
      </h1>

      {/* Watched Movies Section */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
            Watched ({totalWatched})
          </h2>
          {totalWatched > 10 && (
            <Link
              href="/watched"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all {totalWatched} movies →
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          {watchedMovies.map((movie) => (
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
        {watchedMovies.length === 0 && (
          <p className="text-neutral-500 dark:text-neutral-400">
            No watched movies yet.
          </p>
        )}
      </section>

      {/* Watchlist Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
            Watchlist ({totalWatchlist})
          </h2>
          {totalWatchlist > 10 && (
            <Link
              href="/watchlist"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all {totalWatchlist} movies →
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          {watchlistMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={{
                ...movie,
                watchedDate: null,
              }}
            />
          ))}
        </div>
        {watchlistMovies.length === 0 && (
          <p className="text-neutral-500 dark:text-neutral-400">
            No movies in watchlist yet.
          </p>
        )}
      </section>
    </main>
  );
}
