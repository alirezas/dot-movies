"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type Movie, movies } from "@/lib/db/schema";
import { getMovieExtended, getSearchResults } from "@/lib/tvdb/generated";

export const updateMovieData = async (movieOrId: Movie | number) => {
  const movie =
    typeof movieOrId === "number"
      ? await db.query.movies.findFirst({
          where: eq(movies.id, movieOrId),
        })
      : movieOrId;

  if (!movie) {
    throw new Error("Movie not found");
  }

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

  const searchYear = Number(searchResult.year);
  const movieYear = movie.releaseYear;
  const yearMatches =
    !movieYear ||
    !searchResult.year ||
    searchYear === movieYear ||
    Math.abs(searchYear - movieYear) <= 1;

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
      updatedAt: new Date(),
    })
    .where(eq(movies.id, movie.id))
    .returning();

  return updatedMovie[0];
};
