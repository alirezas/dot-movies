import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { type CreditRole, moviePeople, people } from "@/lib/db/schema";
import { absoluteImageUrl } from "@/lib/tvdb/artwork";
import type { Character, MovieExtendedRecord } from "@/lib/tvdb/generated";

const ROLE_BY_PEOPLE_TYPE: Record<string, CreditRole> = {
  Actor: "actor",
  Director: "director",
};

export function creditRole(c: Character): CreditRole | null {
  return c.peopleType ? (ROLE_BY_PEOPLE_TYPE[c.peopleType] ?? null) : null;
}

export type Credit = {
  personId: number;
  personName: string;
  personImage: string | null;
  role: CreditRole;
  character: string | null;
  sort: number | null;
};

export function extractCredits(
  tvdbData: MovieExtendedRecord | null | undefined
): Credit[] {
  // `characters` is null on some stored records
  const characters = Array.isArray(tvdbData?.characters)
    ? tvdbData.characters
    : [];
  const credits = new Map<string, Credit>();

  for (const c of characters) {
    const role = creditRole(c);
    if (!role || !c.peopleId || !c.personName) continue;

    const key = `${c.peopleId}:${role}`;
    const existing = credits.get(key);
    const sort = c.sort ?? null;
    if (existing && (existing.sort ?? Infinity) <= (sort ?? Infinity)) {
      continue;
    }

    credits.set(key, {
      personId: c.peopleId,
      personName: c.personName,
      personImage: absoluteImageUrl(c.personImgURL),
      role,
      character: role === "actor" ? c.name || null : null,
      sort,
    });
  }

  return [...credits.values()];
}

/**
 * Replaces a movie's credits with the actors and directors in its TVDB
 * record, creating any people that don't exist yet.
 */
export async function syncMovieCredits(
  movieId: number,
  tvdbData: MovieExtendedRecord | null | undefined
) {
  const credits = extractCredits(tvdbData);

  const peopleRows = [
    ...new Map(
      credits.map((c) => [
        c.personId,
        { id: c.personId, name: c.personName, imageUrl: c.personImage },
      ])
    ).values(),
  ];

  const deleteCredits = db
    .delete(moviePeople)
    .where(eq(moviePeople.movieId, movieId));

  if (credits.length === 0) {
    await deleteCredits;
    return 0;
  }

  await db.batch([
    db
      .insert(people)
      .values(peopleRows)
      .onConflictDoUpdate({
        target: people.id,
        set: {
          name: sql`excluded.name`,
          imageUrl: sql`coalesce(excluded.image_url, ${people.imageUrl})`,
          updatedAt: sql`now()`,
        },
      }),
    deleteCredits,
    db.insert(moviePeople).values(
      credits.map((c) => ({
        movieId,
        personId: c.personId,
        role: c.role,
        character: c.character,
        sort: c.sort,
      }))
    ),
  ]);

  return credits.length;
}
