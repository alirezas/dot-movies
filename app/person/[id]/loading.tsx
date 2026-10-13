import { MovieCardSkeletonGrid } from "@/components/movie-card-skeleton";

export default function Loading() {
  return (
    <main className="dark min-h-screen bg-background px-6 py-10 text-foreground md:px-14">
      <div className="flex animate-pulse flex-col gap-8 md:flex-row md:items-end">
        <div className="aspect-2/3 w-40 shrink-0 rounded-lg bg-muted md:w-56" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-12 w-80 max-w-full rounded-md bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-12">
        <MovieCardSkeletonGrid count={6} />
      </div>
    </main>
  );
}
