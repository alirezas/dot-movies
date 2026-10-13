import type { Movie } from "@/lib/db/schema/movies";
import { absoluteImageUrl } from "@/lib/tvdb/artwork";
import type { ArtworkBaseRecord } from "@/lib/tvdb/generated";

// TVDB artwork type ids (see /artwork/types)
const ARTWORK_TYPE = {
  poster: 14,
  background: 15,
  clearLogo: 25,
} as const;

export type CastMember = {
  id: number;
  name: string;
  character: string | null;
  image: string | null;
};

export type MovieDetails = {
  id: number;
  title: string;
  releaseYear: number | null;
  watchedDate: string | null;
  letterboxdUrl: string | null;
  overview: string | null;
  tagline: string | null;
  runtime: string | null;
  contentRating: string | null;
  genres: string[];
  directors: { id: number; name: string }[];
  cast: CastMember[];
  backdrops: string[];
  logo: { src: string; width: number; height: number } | null;
  poster: string | null;
  trailerUrl: string | null;
};

function byPreference(a: ArtworkBaseRecord, b: ArtworkBaseRecord): number {
  const aEng = a.language === "eng" ? 0 : 1;
  const bEng = b.language === "eng" ? 0 : 1;
  if (aEng !== bEng) return aEng - bEng;
  return (b.score ?? 0) - (a.score ?? 0);
}

function formatRuntime(minutes: number | null | undefined): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function getMovieDetails(movie: Movie): MovieDetails {
  const tvdb = movie.tvdbData;
  const artworks = tvdb?.artworks ?? [];

  // Backdrops without baked-in text read best behind the hero copy
  const backdrops = artworks
    .filter((a) => a.type === ARTWORK_TYPE.background && a.image)
    .sort(
      (a, b) =>
        Number(a.includesText ?? false) - Number(b.includesText ?? false) ||
        (b.score ?? 0) - (a.score ?? 0)
    )
    .map((a) => absoluteImageUrl(a.image))
    .filter((src): src is string => Boolean(src))
    .slice(0, 6);

  const logoArtwork = artworks
    .filter(
      (a) =>
        a.type === ARTWORK_TYPE.clearLogo &&
        a.image &&
        (!a.language || a.language === "eng")
    )
    .sort(byPreference)[0];
  const logoSrc = absoluteImageUrl(logoArtwork?.image);

  const poster =
    absoluteImageUrl(tvdb?.image) ??
    absoluteImageUrl(
      artworks
        .filter((a) => a.type === ARTWORK_TYPE.poster)
        .sort(byPreference)[0]?.image
    );

  const engOverview = tvdb?.translations?.overviewTranslations?.find(
    (t) => t.language === "eng"
  );

  const people = [...(tvdb?.characters ?? [])].sort(
    (a, b) =>
      (a.sort ?? Number.MAX_SAFE_INTEGER) - (b.sort ?? Number.MAX_SAFE_INTEGER)
  );

  // Keyed by person so an actor with several roles appears once
  const castById = new Map<number, CastMember>();
  for (const c of people) {
    if (c.peopleType !== "Actor" || !c.peopleId || !c.personName) continue;
    if (castById.has(c.peopleId)) continue;
    castById.set(c.peopleId, {
      id: c.peopleId,
      name: c.personName,
      character: c.name || null,
      image: absoluteImageUrl(c.personImgURL ?? c.image),
    });
  }
  const cast = [...castById.values()].slice(0, 20);

  const directors = new Map(
    people
      .filter((c) => c.peopleType === "Director" && c.peopleId && c.personName)
      .map((c) => [c.peopleId as number, c.personName as string])
  );

  const contentRating =
    tvdb?.contentRatings?.find((r) => r.country === "usa")?.name ?? null;

  const trailer =
    tvdb?.trailers?.find((t) => t.language === "eng" && t.url) ??
    tvdb?.trailers?.find((t) => t.url);

  return {
    id: movie.id,
    title: movie.title,
    releaseYear: movie.releaseYear,
    watchedDate: movie.watchedDate,
    letterboxdUrl: movie.letterboxdUrl,
    overview: engOverview?.overview ?? null,
    tagline: engOverview?.tagline ?? null,
    runtime: formatRuntime(tvdb?.runtime),
    contentRating,
    genres: (tvdb?.genres ?? [])
      .map((g) => g.name)
      .filter((name): name is string => Boolean(name))
      .slice(0, 3),
    directors: [...directors].map(([id, name]) => ({ id, name })),
    cast,
    backdrops,
    logo: logoSrc
      ? {
          src: logoSrc,
          width: logoArtwork?.width || 800,
          height: logoArtwork?.height || 310,
        }
      : null,
    poster,
    trailerUrl: trailer?.url ?? null,
  };
}
