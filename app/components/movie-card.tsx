import { TVDBClient } from "@/lib/tvdb/client";
import Link from "next/link";
import { useState } from "react";

interface Movie {
  id: number;
  title: string;
  releaseYear: number | null;
  letterboxdUrl: string | null;
  watchedDate: Date;
}

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = new Date(movie.watchedDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const handleTVDBFetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const movieData = await TVDBClient.searchMovie(
        movie.title,
        movie.releaseYear?.toString()
      );
      console.log("TVDB Data:", movieData);
      // TODO: Handle the fetched data (e.g., update database, show modal, etc.)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch TVDB data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
            {movie.title}
            {movie.releaseYear && (
              <span className="ml-1 text-neutral-500">
                ({movie.releaseYear})
              </span>
            )}
          </h3>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Watched on {formattedDate}
        </p>
        <div className="flex gap-2">
          {movie.letterboxdUrl && (
            <Link
              href={movie.letterboxdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View on Letterboxd
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>
          )}
          <button
            onClick={handleTVDBFetch}
            disabled={isLoading}
            className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isLoading ? "Fetching..." : "Fetch TVDB Data"}
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
