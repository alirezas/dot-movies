"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type Movie, movies } from "@/lib/db/schema";
import { getMovieExtended, getSearchResults } from "@/lib/tvdb/generated";

export const updateMovieData = async (movie: Movie, movieId: number) => {
  const searchQuery = await getSearchResults({
    query: {
      query: movie.title,
      year: movie.releaseYear || undefined,
      type: "movie",
      limit: 1,
    },
  });

  const searchResult = searchQuery.data?.data?.[0];

  if (!searchResult) {
    throw new Error("No movie found");
  }

  if (
    searchResult.name !== movie.title ||
    searchResult.year !== movie.releaseYear?.toString()
  ) {
    throw new Error(
      `${movie.title} (${movie.releaseYear})` +
        ` - ${searchResult.name} (${searchResult.year})` +
        " - Movie data mismatch"
    );
  }

  const extendedMovieQuery = await getMovieExtended({
    path: {
      id: Number(searchResult.id?.split("-")[1]),
    },
  });

  const extendedMovieData = extendedMovieQuery.data?.data;

  if (!extendedMovieData) {
    throw new Error("No extended movie data found");
  }

  const updatedMovie = await db
    .update(movies)
    .set({
      tvdbData: extendedMovieData,
    })
    .where(eq(movies.id, movieId))
    .returning();

  return updatedMovie[0];
};
