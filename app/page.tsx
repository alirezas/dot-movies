import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema/movies";
import { desc } from "drizzle-orm";
import { MovieCard } from "./components/movie-card";

export default async function Home() {
  const watchedMovies = await db
    .select()
    .from(movies)
    .orderBy(desc(movies.watchedDate));

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        My Movie Diary
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {watchedMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={{
              ...movie,
              watchedDate: new Date(movie.watchedDate).toISOString(),
            }}
          />
        ))}
      </div>
    </main>
  );
}
