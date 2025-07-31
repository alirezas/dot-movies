import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema/movies";
import { desc, isNotNull, isNull } from "drizzle-orm";
import { MovieCard } from "./components/movie-card";

export default async function Home() {
  const [watchedMovies, watchlistMovies] = await Promise.all([
    db
      .select()
      .from(movies)
      .where(isNotNull(movies.watchedDate))
      .orderBy(desc(movies.watchedDate)),
    db
      .select()
      .from(movies)
      .where(isNull(movies.watchedDate))
      .orderBy(desc(movies.createdAt)),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        My Movie Diary
      </h1>

      {/* Watched Movies Section */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
          Watched ({watchedMovies.length})
        </h2>
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
        <h2 className="mb-6 text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
          Watchlist ({watchlistMovies.length})
        </h2>
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
