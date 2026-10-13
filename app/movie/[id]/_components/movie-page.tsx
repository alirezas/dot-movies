import { Bookmark, Eye, Info, Play } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { HeroBackdrop } from "@/app/movie/[id]/_components/hero-backdrop";
import type { MovieDetails } from "@/app/movie/[id]/_lib/movie-details";
import { cn } from "@/lib/utils";

type Props = {
  movie: MovieDetails;
};

const MoviePage = ({ movie }: Props) => {
  const heroImages = movie.backdrops.length
    ? movie.backdrops
    : movie.poster
      ? [movie.poster]
      : [];
  const gallery = movie.backdrops.slice(1);
  const meta = [
    movie.releaseYear,
    movie.contentRating,
    movie.runtime,
    movie.genres.join(" · ") || null,
  ].filter(Boolean);

  return (
    <main className="dark relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <section className="relative h-[85vh] min-h-[560px] w-full">
        <HeroBackdrop images={heroImages} alt={movie.title} />

        {/* Fade the artwork into the page on the left and bottom edges */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-background via-background/70 to-transparent md:w-3/4" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-background via-background/60 to-transparent" />

        <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end gap-5 px-6 pb-36 md:px-14">
          {movie.watchedDate ? (
            <Badge>
              <Eye className="size-3.5 text-amber-500" />
              Watched{" "}
              {new Date(movie.watchedDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Badge>
          ) : (
            <Badge>
              <Bookmark className="size-3.5 text-amber-500" />
              On your watchlist
            </Badge>
          )}

          {movie.logo ? (
            <h1>
              <span className="sr-only">{movie.title}</span>
              <Image
                src={movie.logo.src}
                alt=""
                width={movie.logo.width}
                height={movie.logo.height}
                priority
                className="h-auto max-h-40 w-auto max-w-[min(28rem,100%)] object-contain object-left drop-shadow-2xl"
              />
            </h1>
          ) : (
            <h1 className="text-balance font-black text-5xl uppercase leading-[0.95] tracking-tight drop-shadow-2xl md:text-7xl">
              {movie.title}
            </h1>
          )}

          {meta.length > 0 && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-medium text-sm text-white/80">
              {meta.map((item) => (
                <span
                  key={String(item)}
                  className={cn(
                    item === movie.contentRating &&
                      "rounded-sm border border-white/40 px-1.5 text-xs"
                  )}
                >
                  {item}
                </span>
              ))}
            </p>
          )}

          {movie.tagline && (
            <p className="font-medium text-lg text-white/90 italic">
              {movie.tagline}
            </p>
          )}

          {movie.overview && (
            <p className="line-clamp-4 max-w-xl text-base text-white/85 leading-relaxed md:text-lg">
              {movie.overview}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            {movie.trailerUrl && (
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 font-semibold text-black text-lg transition-colors hover:bg-white/80"
              >
                <Play className="size-5 fill-current" />
                Trailer
              </a>
            )}
            {movie.letterboxdUrl && (
              <a
                href={movie.letterboxdUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-neutral-500/50 px-6 py-2.5 font-semibold text-lg text-white backdrop-blur-sm transition-colors hover:bg-neutral-500/35"
              >
                <Info className="size-5" />
                More Info
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="relative z-10 -mt-24 space-y-10 pb-16">
        {movie.cast.length > 0 && (
          <Row title="Cast">
            {movie.cast.map((person) => (
              <CastCard key={person.id} person={person} />
            ))}
          </Row>
        )}

        {gallery.length > 0 && (
          <Row title="Gallery">
            {gallery.map((src) => (
              <div
                key={src}
                className="relative aspect-video w-72 shrink-0 snap-start overflow-hidden rounded-md bg-muted md:w-80"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="320px"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </Row>
        )}

        {(movie.directors.length > 0 || movie.genres.length > 0) && (
          <dl className="grid max-w-3xl gap-x-8 gap-y-2 px-6 text-sm md:grid-cols-[auto_1fr] md:px-14">
            {movie.directors.length > 0 && (
              <>
                <dt className="text-muted-foreground">Directed by</dt>
                <dd>{movie.directors.join(", ")}</dd>
              </>
            )}
            {movie.cast.length > 0 && (
              <>
                <dt className="text-muted-foreground">Starring</dt>
                <dd>
                  {movie.cast
                    .slice(0, 4)
                    .map((p) => p.name)
                    .join(", ")}
                </dd>
              </>
            )}
            {movie.genres.length > 0 && (
              <>
                <dt className="text-muted-foreground">Genres</dt>
                <dd>{movie.genres.join(", ")}</dd>
              </>
            )}
          </dl>
        )}
      </div>
    </main>
  );
};

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 font-semibold text-white/90 text-xs uppercase tracking-widest backdrop-blur-md">
      {children}
    </span>
  );
}

function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 px-6 font-semibold text-xl md:px-14">{title}</h2>
      <div className="flex snap-x scroll-px-6 gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:scroll-px-14 md:px-14">
        {children}
      </div>
    </section>
  );
}

function CastCard({ person }: { person: MovieDetails["cast"][number] }) {
  const initials = person.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="group relative aspect-2/3 w-36 shrink-0 snap-start overflow-hidden rounded-md bg-muted md:w-40">
      {person.image ? (
        <Image
          src={person.image}
          alt={person.name}
          fill
          sizes="160px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="grid h-full place-items-center font-bold text-3xl text-muted-foreground">
          {initials}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/70 to-transparent p-2.5 pt-10 text-white">
        <p className="truncate font-semibold text-sm">{person.name}</p>
        {person.character && (
          <p className="truncate text-white/70 text-xs">{person.character}</p>
        )}
      </div>
    </div>
  );
}

export default MoviePage;
