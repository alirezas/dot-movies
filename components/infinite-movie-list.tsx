"use client";

import { MovieCard } from "@/components/movie-card";
import { MovieCardSkeleton } from "@/components/movie-card-skeleton";
import type { MovieCardData } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

function useGridColumns(gridRef: React.RefObject<HTMLDivElement | null>) {
  const [columns, setColumns] = useState(0);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const measure = () => {
      const style = getComputedStyle(grid);
      const cols = style.gridTemplateColumns.split(" ").length;
      setColumns(cols);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [gridRef]);

  return columns;
}

type InfiniteMovieListProps = {
  initialMovies: MovieCardData[];
  initialHasMore?: boolean;
  fetchParams?: string;
};

export function InfiniteMovieList({
  initialMovies,
  initialHasMore = true,
  fetchParams = "",
}: InfiniteMovieListProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const observerTarget = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const columns = useGridColumns(gridRef);
  const isLoadingRef = useRef(false);
  const serverOffsetRef = useRef(initialMovies.length);

  // Number of movies to show: trim to nearest multiple of columns
  const visibleCount =
    columns > 0
      ? Math.floor(movies.length / columns) * columns
      : movies.length;
  const visibleMovies = movies.slice(0, visibleCount);

  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const loadMoreMovies = useCallback(async () => {
    if (isLoadingRef.current || columnsRef.current === 0) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const cols = columnsRef.current;
      const offset = serverOffsetRef.current;
      const remainder = offset % cols;
      // Fetch enough to fill 2 full rows + cover the trimmed remainder
      const limit = cols * 2 + (remainder > 0 ? cols - remainder : 0);
      const params = new URLSearchParams(fetchParams);
      params.set("offset", String(offset));
      params.set("limit", String(limit));
      const response = await fetch(`/api/movies?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const newMovies: MovieCardData[] = await response.json();

      // Always advance the server offset by how many we received
      serverOffsetRef.current += newMovies.length;

      if (newMovies.length === 0 || newMovies.length < limit) {
        setHasMore(false);
      }
      if (newMovies.length > 0) {
        setMovies((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueNewMovies = newMovies.filter(
            (movie) => !existingIds.has(movie.id)
          );
          return [...prev, ...uniqueNewMovies];
        });
      }
    } catch (error) {
      console.error("Error loading more movies:", error);
      setHasMore(false);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [fetchParams]);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget || !hasMore) return;

    let pending = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (!isLoadingRef.current) {
            loadMoreMovies();
          } else {
            pending = true;
          }
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(currentTarget);

    // Re-check after loading finishes — if sentinel is still visible, load again
    const interval = setInterval(() => {
      if (pending && !isLoadingRef.current) {
        pending = false;
        loadMoreMovies();
      }
    }, 200);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [hasMore, loadMoreMovies]);

  if (movies.length === 0) {
    return null;
  }

  const skeletonCount = columns > 0 ? columns : 0;

  return (
    <>
      <div
        ref={gridRef}
        className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]"
      >
        {visibleMovies.map((movie, i) => (
          <MovieCard key={movie.id} movie={movie} priority={i < 18} />
        ))}
        {hasMore && isLoading &&
          Array.from({ length: skeletonCount }, (_, i) => (
            <MovieCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>
      {hasMore && <div ref={observerTarget} className="mt-64" />}
    </>
  );
}
