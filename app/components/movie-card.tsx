"use client";

import { updateMovieData } from "@/actions/update-movie-data";
import { Movie } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
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
    <Link
      href={`/movie/${movie.id}`}
      className={cn(
        ["relative overflow-hidden w-[200px] aspect-2/3 rounded-lg shadow-2xl"],
        [
          "after:absolute after:z-10 after:inset-0 after:border after:mix-blend-color-dodge after:w-[calc(100%-1px)] after:h-[calc(100%-1px)] after:rounded-[calc(var(--radius-lg)-1px)] after:border-white/10",
        ]
      )}
    >
      <Image
        src={movie.tvdbData?.image || "/placeholder.svg"}
        alt={movie.title}
        fill
        className="object-cover z-0"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/60 to-background/0 p-2 pt-6 text-sm z-10 text-shadow-xs">
        <h2 className="font-semibold truncate">{movie.title}</h2>
        <span className="opacity-80 text-xs">({movie.releaseYear})</span>
      </div>
    </Link>
  );
}
