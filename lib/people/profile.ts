import { eq } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/lib/db";
import {
  type CreditRole,
  type FilmographyEntry,
  type Person,
  people,
} from "@/lib/db/schema";
import { creditRole } from "@/lib/people/credits";
import { absoluteImageUrl } from "@/lib/tvdb/artwork";
import {
  getPeopleExtended,
  type PeopleExtendedRecord,
} from "@/lib/tvdb/generated";

const PROFILE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type PersonProfile = Pick<
  Person,
  "name" | "imageUrl" | "bio" | "birthDate" | "deathDate" | "filmography"
>;

function isoDate(value: string | undefined): string | null {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function toFilmography(record: PeopleExtendedRecord): FilmographyEntry[] {
  const films = new Map<number, FilmographyEntry>();

  for (const c of record.characters ?? []) {
    const role = creditRole(c);
    if (!role || !c.movieId || !c.movie?.name) continue;

    const film = films.get(c.movieId);
    if (film) {
      if (!film.roles.includes(role)) film.roles.push(role);
      continue;
    }

    const year = Number.parseInt(c.movie.year ?? "", 10);
    films.set(c.movieId, {
      tvdbMovieId: c.movieId,
      name: c.movie.name,
      year: Number.isNaN(year) ? null : year,
      image: absoluteImageUrl(c.movie.image),
      roles: [role] as CreditRole[],
    });
  }

  return [...films.values()].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

export async function fetchPersonProfile(
  id: number
): Promise<PersonProfile | null> {
  const { data } = await getPeopleExtended({ path: { id } });
  const record = data?.data;
  if (!record?.name) return null;

  const bio =
    record.biographies?.find((b) => b.language === "eng")?.biography?.trim() ||
    null;

  return {
    name: record.name,
    imageUrl: absoluteImageUrl(record.image),
    bio,
    birthDate: isoDate(record.birth),
    deathDate: isoDate(record.death),
    filmography: toFilmography(record),
  };
}

export async function savePersonProfile(id: number, profile: PersonProfile) {
  await db
    .update(people)
    .set({
      ...profile,
      // Keep the credit image when TVDB has no profile image
      imageUrl: profile.imageUrl ?? undefined,
      profileFetchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(people.id, id));
}

export function isProfileStale(person: Person): boolean {
  return (
    !person.profileFetchedAt ||
    Date.now() - person.profileFetchedAt.getTime() > PROFILE_MAX_AGE_MS
  );
}

/**
 * Returns the person's TVDB profile, refreshing the copy stored in `people`
 * when it's missing or stale. Falls back to the stored copy if TVDB fails.
 */
export async function getPersonProfile(person: Person): Promise<PersonProfile> {
  if (!isProfileStale(person)) return person;

  try {
    const profile = await fetchPersonProfile(person.id);
    if (!profile) return person;

    after(() => savePersonProfile(person.id, profile));
    return { ...profile, imageUrl: profile.imageUrl ?? person.imageUrl };
  } catch (error) {
    console.error(
      `Failed to fetch TVDB profile for person ${person.id}`,
      error
    );
    return person;
  }
}
