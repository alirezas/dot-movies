"use client";

import { MovieCard } from "@/components/movie-card";
import type { Movie } from "@/lib/db/schema/movies";
import { useCallback, useEffect, useRef, useState } from "react";

type InfiniteMovieListProps = {
  initialMovies: Movie[];
  fetchParams?: string;
};

export function InfiniteMovieList({
  initialMovies,
  fetchParams = "",
}: InfiniteMovieListProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialMovies.length >= 20);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreMovies = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const offset = movies.length;
      const limit = 10;
      const params = new URLSearchParams(fetchParams);
      params.set("offset", String(offset));
      params.set("limit", String(limit));
      const response = await fetch(`/api/movies?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const newMovies: Movie[] = await response.json();

      if (newMovies.length === 0) {
        setHasMore(false);
      } else {
        setMovies((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueNewMovies = newMovies.filter(
            (movie) => !existingIds.has(movie.id)
          );
          return [...prev, ...uniqueNewMovies];
        });
        if (newMovies.length < limit) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error loading more movies:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, movies.length, fetchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMoreMovies();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMoreMovies]);

  if (movies.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      {hasMore && (
        <div ref={observerTarget} className="mt-8 flex justify-center">
          {isLoading && (
            <div className="text-neutral-600 dark:text-neutral-400">
              Loading more movies...
            </div>
          )}
        </div>
      )}
    </>
  );
}
