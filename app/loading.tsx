import { MovieCardSkeletonGrid } from "@/components/movie-card-skeleton";

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            All Movies
          </h1>
          <div className="mt-2 flex gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <span>Loading...</span>
          </div>
        </div>
      </div>
      <MovieCardSkeletonGrid count={24} />
    </main>
  );
}
