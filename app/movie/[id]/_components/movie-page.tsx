"use client";

import { Movie } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  movie: Movie;
};

const MoviePage = ({ movie }: Props) => {
  const artworks = movie.tvdbData?.artworks || [];
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);

  useEffect(() => {
    if (artworks.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentArtworkIndex((prev) => (prev + 1) % artworks.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [artworks.length]);

  const currentArtwork = artworks[currentArtworkIndex]?.image || "";

  return (
    <>
      <div
        className="bg-cover bg-center bg-no-repeat w-full h-screen fixed inset-0 z-0 blur-xl opacity-10"
        style={{
          backgroundImage: `url(${movie.tvdbData?.artworks?.[0]?.image})`,
        }}
      ></div>
      <div className="container relative z-10 max-w-screen-lg mx-auto px-4 py-8">
        <div
          className={cn(
            [
              "relative w-full aspect-video rounded-4xl shadow-2xl overflow-hidden",
            ],
            [
              "after:absolute after:z-10 after:inset-0 after:border after:mix-blend-color-dodge after:w-[calc(100%-1px)] after:h-[calc(100%-1px)] after:rounded-[calc(var(--radius-4xl)-1px)] after:border-white/10",
            ]
          )}
        >
          <Image
            src={currentArtwork || "/placeholder.svg"}
            alt={movie.title}
            fill
            className="object-cover z-0"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/60 to-background/0 p-8 pt-16 text-sm z-10 text-shadow-xs">
            <h2 className="font-bold text-6xl truncate">{movie.title}</h2>
            <span className="opacity-80 font-semibold text-xl">
              ({movie.releaseYear})
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MoviePage;
