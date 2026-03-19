export function MovieCardSkeleton() {
  return (
    <div className="relative w-full aspect-2/3 rounded-lg bg-neutral-800 overflow-hidden animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-2 pt-6 space-y-1">
        <div className="h-4 w-3/4 rounded bg-neutral-700" />
        <div className="h-3 w-1/4 rounded bg-neutral-700" />
      </div>
    </div>
  );
}

export function MovieCardSkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
      {Array.from({ length: count }, (_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
