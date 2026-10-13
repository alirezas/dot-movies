import { Bookmark, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cache, type ReactNode, Suspense } from "react";
import { MovieCard } from "@/components/movie-card";
import { MovieCardSkeletonGrid } from "@/components/movie-card-skeleton";
import type { CreditRole, Person } from "@/lib/db/schema";
import { getPersonProfile } from "@/lib/people/profile";
import { getLibraryIdsByTvdbId, type PersonMovie } from "@/lib/queries/people";
import { toMovieCardData } from "@/lib/types";

type Props = {
  person: Person;
  credits: PersonMovie[];
};

// Bio and "Other films" both need the profile; fetch it once per request
const loadProfile = cache((person: Person) => getPersonProfile(person));

const ROLE_LABEL: Record<CreditRole, string> = {
  actor: "Actor",
  director: "Director",
};

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Date(value).toLocaleDateString("en-US", {
    timeZone: "UTC",
    ...options,
  });
}

function yearsBetween(from: string, to: Date) {
  const start = new Date(from);
  let years = to.getUTCFullYear() - start.getUTCFullYear();
  const beforeBirthday =
    to.getUTCMonth() < start.getUTCMonth() ||
    (to.getUTCMonth() === start.getUTCMonth() &&
      to.getUTCDate() < start.getUTCDate());
  if (beforeBirthday) years--;
  return years;
}

function creditLabel(credit: Pick<PersonMovie, "roles" | "character">) {
  const parts: string[] = [];
  if (credit.roles.includes("director")) parts.push("Director");
  if (credit.roles.includes("actor")) {
    parts.push(credit.character ? `as ${credit.character}` : "Actor");
  }
  return parts.join(" · ");
}

const PersonPage = ({ person, credits }: Props) => {
  const watched = credits.filter((c) => c.movie.watchedDate);
  const watchlist = credits.filter((c) => !c.movie.watchedDate);

  const roles = (["actor", "director"] as const).filter((role) =>
    credits.some((c) => c.roles.includes(role))
  );

  const firstWatched = watched
    .map((c) => c.movie.watchedDate as string)
    .sort()[0];

  const stats = [
    watched.length > 0 &&
      `Watched ${watched.length} film${watched.length === 1 ? "" : "s"}`,
    watchlist.length > 0 && `${watchlist.length} on your watchlist`,
    firstWatched &&
      `first on ${formatDate(firstWatched, { month: "short", day: "numeric", year: "numeric" })}`,
  ].filter(Boolean);

  const initials = person.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <main className="dark min-h-screen bg-background px-6 py-10 text-foreground md:px-14">
      <section className="flex flex-col gap-8 md:flex-row md:items-end">
        <div className="relative aspect-2/3 w-40 shrink-0 overflow-hidden rounded-lg bg-muted shadow-2xl md:w-56">
          {person.imageUrl ? (
            <Image
              src={person.imageUrl}
              alt={person.name}
              fill
              sizes="224px"
              priority
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center font-bold text-5xl text-muted-foreground">
              {initials}
            </div>
          )}
        </div>

        <div className="flex max-w-3xl flex-col gap-3">
          {roles.length > 0 && (
            <p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
              {roles.map((r) => ROLE_LABEL[r]).join(" · ")}
            </p>
          )}
          <h1 className="text-balance font-black text-4xl leading-[0.95] tracking-tight md:text-6xl">
            {person.name}
          </h1>
          <Suspense
            fallback={
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
            }
          >
            <LifeDates person={person} />
          </Suspense>
          {stats.length > 0 && (
            <p className="flex flex-wrap items-center gap-x-2 text-sm text-white/80">
              <Eye className="size-4 text-amber-500" />
              {stats.join(" · ")}
            </p>
          )}
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mt-8 max-w-3xl space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        }
      >
        <Bio person={person} />
      </Suspense>

      <div className="mt-12 space-y-12">
        {watched.length > 0 && (
          <Section
            title="Watched"
            icon={<Eye className="size-5 text-amber-500" />}
          >
            <CreditGrid credits={watched} />
          </Section>
        )}

        {watchlist.length > 0 && (
          <Section
            title="On your watchlist"
            icon={<Bookmark className="size-5 text-amber-500" />}
          >
            <CreditGrid credits={watchlist} />
          </Section>
        )}

        <Suspense
          fallback={
            <Section title="Other films">
              <MovieCardSkeletonGrid count={6} />
            </Section>
          }
        >
          <OtherFilms
            person={person}
            shownMovieIds={new Set(credits.map((c) => c.movie.id))}
          />
        </Suspense>
      </div>
    </main>
  );
};

async function LifeDates({ person }: { person: Person }) {
  const { birthDate, deathDate } = await loadProfile(person);
  if (!birthDate && !deathDate) return null;

  const long = { month: "long", day: "numeric", year: "numeric" } as const;
  let text: string;
  if (birthDate && deathDate) {
    text = `${formatDate(birthDate, long)} – ${formatDate(deathDate, long)} (aged ${yearsBetween(birthDate, new Date(deathDate))})`;
  } else if (birthDate) {
    text = `Born ${formatDate(birthDate, long)} (age ${yearsBetween(birthDate, new Date())})`;
  } else {
    text = `Died ${formatDate(deathDate as string, long)}`;
  }

  return <p className="font-medium text-sm text-white/80">{text}</p>;
}

async function Bio({ person }: { person: Person }) {
  const { bio } = await loadProfile(person);
  if (!bio) return null;

  return (
    <p className="mt-8 max-w-3xl whitespace-pre-line text-base text-white/85 leading-relaxed">
      {bio}
    </p>
  );
}

async function OtherFilms({
  person,
  shownMovieIds,
}: {
  person: Person;
  shownMovieIds: Set<number>;
}) {
  const { filmography } = await loadProfile(person);
  if (!filmography?.length) return null;

  // TVDB credits can be missing from a library movie's own record, so link
  // those instead of hiding them
  const libraryIds = await getLibraryIdsByTvdbId(
    filmography.map((f) => f.tvdbMovieId)
  );
  const films = filmography
    .map((film) => ({ ...film, movieId: libraryIds.get(film.tvdbMovieId) }))
    .filter((film) => !film.movieId || !shownMovieIds.has(film.movieId));

  if (films.length === 0) return null;

  return (
    <Section title="Other films">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
        {films.map((film) => {
          const tile = (
            <>
              <div className="relative aspect-2/3 overflow-hidden rounded-md bg-muted">
                {film.image ? (
                  <Image
                    src={film.image}
                    alt={film.name}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center p-3 text-center text-muted-foreground text-sm">
                    {film.name}
                  </div>
                )}
              </div>
              <p className="mt-2 truncate font-medium text-sm">{film.name}</p>
              <p className="truncate text-muted-foreground text-xs">
                {[film.year, film.roles.map((r) => ROLE_LABEL[r]).join(" · ")]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </>
          );

          return film.movieId ? (
            <Link
              key={film.tvdbMovieId}
              href={`/movie/${film.movieId}`}
              className="opacity-90 transition-opacity hover:opacity-100"
            >
              {tile}
            </Link>
          ) : (
            <div key={film.tvdbMovieId} className="opacity-70">
              {tile}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function CreditGrid({ credits }: { credits: PersonMovie[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {credits.map((credit) => (
        <div key={credit.movie.id}>
          <MovieCard movie={toMovieCardData(credit.movie)} />
          <p className="mt-2 truncate text-muted-foreground text-xs">
            {creditLabel(credit)}
          </p>
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

export default PersonPage;
