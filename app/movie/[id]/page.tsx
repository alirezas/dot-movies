import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import MoviePage from "@/app/movie/[id]/_components/movie-page";
import { getMovieDetails } from "@/app/movie/[id]/_lib/movie-details";
import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const movie = await db.query.movies.findFirst({
    where: eq(movies.id, Number(id)),
  });

  if (!movie) {
    notFound();
  }

  return <MoviePage movie={getMovieDetails(movie)} />;
}
