import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
      <h2 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Not Found
      </h2>
      <p className="mb-4 text-neutral-500 dark:text-neutral-400">
        Could not find the requested page
      </p>
      <Link
        href="/"
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Go Home
      </Link>
    </main>
  );
}
