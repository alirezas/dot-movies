"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type Movie, movies } from "@/lib/db/schema";
import { syncMovieCredits } from "@/lib/people/credits";
import { getMovieExtended } from "@/lib/tvdb/generated";
import { findTvdbMovie } from "@/lib/tvdb/match";

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

  const searchResult = await findTvdbMovie(movie.title, movie.releaseYear);
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

  await syncMovieCredits(movie.id, extendedMovieData);

  return updatedMovie[0];
};
