import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import MoviePage from "@/app/movie/[id]/_components/movie-page";
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

  const artworks = movie.tvdbData?.artworks?.map((a) => a.image).filter(Boolean) as string[] ?? [];

  return (
    <MoviePage
      title={movie.title}
      releaseYear={movie.releaseYear}
      poster={movie.tvdbData?.artworks?.[0]?.image ?? null}
      artworks={artworks}
    />
  );
}
