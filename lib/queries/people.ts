import { desc, eq, inArray } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import {
  type CreditRole,
  type Movie,
  moviePeople,
  movies,
  people,
} from "@/lib/db/schema";

export const getPerson = cache(async (id: number) => {
  return await db.query.people.findFirst({ where: eq(people.id, id) });
});

export type PersonMovie = {
  movie: Movie;
  roles: CreditRole[];
  character: string | null;
};

export const getPersonMovies = cache(
  async (id: number): Promise<PersonMovie[]> => {
    const rows = await db
      .select({
        movie: movies,
        role: moviePeople.role,
        character: moviePeople.character,
      })
      .from(moviePeople)
      .innerJoin(movies, eq(moviePeople.movieId, movies.id))
      .where(eq(moviePeople.personId, id))
      .orderBy(desc(movies.releaseYear), movies.title);

    // A person who both acted in and directed a film gets one entry
    const byMovie = new Map<number, PersonMovie>();
    for (const row of rows) {
      const existing = byMovie.get(row.movie.id);
      if (existing) {
        existing.roles.push(row.role);
        existing.character ??= row.character;
      } else {
        byMovie.set(row.movie.id, {
          movie: row.movie,
          roles: [row.role],
          character: row.character,
        });
      }
    }

    return [...byMovie.values()];
  }
);

/** Maps TVDB movie ids to library movie ids. */
export async function getLibraryIdsByTvdbId(
  tvdbIds: number[]
): Promise<Map<number, number>> {
  if (tvdbIds.length === 0) return new Map();

  const rows = await db
    .select({ id: movies.id, tvdbId: movies.tvdbId })
    .from(movies)
    .where(inArray(movies.tvdbId, tvdbIds));

  return new Map(
    rows.flatMap((r) => (r.tvdbId === null ? [] : [[r.tvdbId, r.id]]))
  );
}
