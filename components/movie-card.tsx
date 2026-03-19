"use client";

import { updateMovieData } from "@/actions/update-movie-data";
import type { Movie } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { EyeIcon, Loader2, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetTVDBData = async () => {
    try {
      setIsLoading(true);
      await updateMovieData(movie);
      toast.success("TVDB data updated");
      router.refresh();
    } catch {
      toast.error("Error getting TVDB data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        ["relative overflow-hidden w-[200px] aspect-2/3 rounded-lg shadow-2xl"],
        [
          "after:absolute after:z-10 after:inset-0 after:border after:mix-blend-color-dodge after:w-[calc(100%-1px)] after:h-[calc(100%-1px)] after:rounded-[calc(var(--radius-lg)-1px)] after:border-white/10",
        ]
      )}
    >
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        {/* Watched indicator */}
        {movie.watchedDate && (
          <div className="size-6 rounded grid place-items-center bg-amber-500/20">
            <EyeIcon className="size-4 text-amber-500" />
          </div>
        )}
        {process.env.NODE_ENV === "development" && (
          <button
            className="size-6 rounded grid place-items-center bg-blue-500/20"
            type="button"
            onClick={handleGetTVDBData}
          >
            {isLoading ? (
              <Loader2 className="size-4 text-blue-500 animate-spin" />
            ) : (
              <RefreshCcw className="size-4 text-blue-500" />
            )}
          </button>
        )}
      </div>
      <Link href={`/movie/${movie.id}`}>
        <Image
          src={movie.tvdbData?.image || "/placeholder.svg"}
          alt={movie.title}
          fill
          sizes="200px"
          className="object-cover z-0"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/60 to-background/0 p-2 pt-6 text-sm z-10 text-shadow-xs">
          <h2 className="font-semibold truncate">{movie.title}</h2>
          <span className="opacity-80 text-xs">({movie.releaseYear})</span>
        </div>
      </Link>
    </div>
  );
}
