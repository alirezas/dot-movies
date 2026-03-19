import {
  getMoviesPaginated,
  getWatchedMoviesPaginated,
  getWatchlistMoviesPaginated,
} from "@/lib/queries/movies";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const watched = searchParams.get("watched") === "true";
  const watchlist = searchParams.get("watchlist") === "true";

  try {
    const movies = watched
      ? await getWatchedMoviesPaginated(offset, limit)
      : watchlist
        ? await getWatchlistMoviesPaginated(offset, limit)
        : await getMoviesPaginated(offset, limit);

    return NextResponse.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}
