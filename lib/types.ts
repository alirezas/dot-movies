import type { Movie } from "@/lib/db/schema/movies";

export type MovieCardData = {
  id: number;
  title: string;
  releaseYear: number | null;
  watchedDate: string | null;
  posterUrl: string | null;
};

export function toMovieCardData(movie: Movie): MovieCardData {
  return {
    id: movie.id,
    title: movie.title,
    releaseYear: movie.releaseYear,
    watchedDate: movie.watchedDate,
    posterUrl: movie.tvdbData?.image ?? null,
  };
}
