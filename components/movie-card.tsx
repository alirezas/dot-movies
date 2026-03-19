"use client";

import type { MovieCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EyeIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const DevRefreshButton =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
        import("./dev-refresh-button").then((m) => m.DevRefreshButton)
      )
    : null;

interface MovieCardProps {
  movie: MovieCardData;
}

export function MovieCard({ movie }: MovieCardProps) {
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
        {movie.watchedDate && (
          <div className="size-6 rounded grid place-items-center bg-amber-500/20">
            <EyeIcon className="size-4 text-amber-500" />
          </div>
        )}
        {DevRefreshButton && <DevRefreshButton movieId={movie.id} />}
      </div>
      <Link href={`/movie/${movie.id}`}>
        <Image
          src={movie.posterUrl || "/placeholder.svg"}
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
