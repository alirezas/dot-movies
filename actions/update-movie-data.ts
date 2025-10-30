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

  // Year must match (within 1 year tolerance for edge cases)
  const searchYear = Number(searchResult.year);
  const movieYear = movie.releaseYear;
  const yearMatches =
    !movieYear ||
    !searchResult.year ||
    searchYear === movieYear ||
    Math.abs(searchYear - movieYear) <= 1;

  // If year matches, trust the API result (titles can be in different languages/scripts)
  // The API might return the original language title (e.g., Persian, Arabic) which is fine
  if (!yearMatches) {
    throw new Error(
      `${movie.title} (${movie.releaseYear})` +
        ` - ${searchResult.name} (${searchResult.year})` +
        " - Year mismatch"
    );
  }

  const tvdbId = Number(searchResult.id?.split("-")[1]);

  const extendedMovieQuery = await getMovieExtended({
    path: {
      id: tvdbId,
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
