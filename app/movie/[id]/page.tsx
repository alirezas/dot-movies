import MoviePage from "@/app/movie/[id]/_components/movie-page";
import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  const movie = await db.query.movies.findFirst({
    where: eq(movies.id, Number(id)),
  });

  if (!movie) {
    return <div>Movie not found</div>;
  }

  return <MoviePage movie={movie} />;
};

export default Page;
