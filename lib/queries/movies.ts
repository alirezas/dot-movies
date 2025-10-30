import { cache } from "react";
import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema/movies";
import { count, desc, isNotNull, isNull } from "drizzle-orm";
import type { Movie } from "@/lib/db/schema/movies";

export type MovieCounts = {
  total: number;
  watched: number;
  watchlist: number;
};

export const getMovieCounts = cache(async (): Promise<MovieCounts> => {
  const [totalResult, watchedResult, watchlistResult] = await Promise.all([
    db.select({ count: count() }).from(movies),
    db
      .select({ count: count() })
      .from(movies)
      .where(isNotNull(movies.watchedDate)),
    db
      .select({ count: count() })
      .from(movies)
      .where(isNull(movies.watchedDate)),
  ]);

  return {
    total: totalResult[0]?.count ?? 0,
    watched: watchedResult[0]?.count ?? 0,
    watchlist: watchlistResult[0]?.count ?? 0,
  };
});

export const getMoviesPaginated = cache(
  async (offset: number, limit: number): Promise<Movie[]> => {
    return await db
      .select()
      .from(movies)
      .orderBy(desc(movies.releaseYear))
      .limit(limit)
      .offset(offset);
  }
);

export const getWatchedMoviesPaginated = cache(
  async (offset: number, limit: number): Promise<Movie[]> => {
    return await db
      .select()
      .from(movies)
      .where(isNotNull(movies.watchedDate))
      .orderBy(desc(movies.watchedDate))
      .limit(limit)
      .offset(offset);
  }
);

export const getWatchlistMoviesPaginated = cache(
  async (offset: number, limit: number): Promise<Movie[]> => {
    return await db
      .select()
      .from(movies)
      .where(isNull(movies.watchedDate))
      .orderBy(desc(movies.createdAt))
      .limit(limit)
      .offset(offset);
  }
);
