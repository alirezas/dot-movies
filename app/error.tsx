"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
      <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Something went wrong
      </h2>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        type="button"
      >
        Try again
      </button>
    </main>
  );
}
