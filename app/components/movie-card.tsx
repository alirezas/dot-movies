"use client";

import { updateMovieData } from "@/actions/update-movie-data";
import { Movie } from "@/lib/db/schema";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();

  const formattedDate = new Date(movie.watchedDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const handleGetTVDBData = async () => {
    try {
      await updateMovieData(movie, movie.id);
      toast.success("TVDB data updated");
      router.refresh();
    } catch (error) {
      toast.error("Error getting TVDB data");
    }
  };

  return (
    <div className="">
      <div className="flex flex-col gap-2">
        <Image
          src={movie.tvdbData?.image || "/placeholder.svg"}
          alt={movie.title}
          width={200}
          height={600}
          className="aspect-2/3 object-cover rounded-lg"
        />

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
            onClick={handleGetTVDBData}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Get TVDB Data
          </button>
        </div>
      </div>
    </div>
  );
}
