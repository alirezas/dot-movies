import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema/movies";
import { desc, isNull } from "drizzle-orm";
import Link from "next/link";
import { MovieCard } from "../components/movie-card";

export default async function WatchlistPage() {
  const watchlistMovies = await db
    .select()
    .from(movies)
    .where(isNull(movies.watchedDate))
    .orderBy(desc(movies.createdAt));

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Watchlist
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {watchlistMovies.length} movies to watch
          </p>
        </div>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to Home
        </Link>
      </div>

      {watchlistMovies.length > 0 ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Your watchlist is empty
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            Add movies to your watchlist and they'll appear here
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
