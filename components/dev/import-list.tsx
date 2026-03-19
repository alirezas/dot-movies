import type { ImportLog } from "@/lib/db/schema/import-logs";
import Link from "next/link";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
    running: "bg-blue-100 text-blue-700 animate-pulse dark:bg-blue-900 dark:text-blue-300",
    completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

export function ImportList({ imports }: { imports: ImportLog[] }) {
  if (imports.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No imports yet
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
            <th className="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-400">Slug</th>
            <th className="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-400">Status</th>
            <th className="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-400">Source</th>
            <th className="px-4 py-2 text-right font-medium text-neutral-600 dark:text-neutral-400">Total</th>
            <th className="px-4 py-2 text-right font-medium text-neutral-600 dark:text-neutral-400">Inserted</th>
            <th className="px-4 py-2 text-right font-medium text-neutral-600 dark:text-neutral-400">Updated</th>
            <th className="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-400">Date</th>
          </tr>
        </thead>
        <tbody>
          {imports.map((imp) => (
            <tr
              key={imp.id}
              className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
            >
              <td className="px-4 py-2">
                <Link
                  href={`/dev/import/${imp.slug}`}
                  className="font-mono text-blue-600 hover:underline dark:text-blue-400"
                >
                  {imp.slug}
                </Link>
              </td>
              <td className="px-4 py-2">
                <StatusBadge status={imp.status} />
              </td>
              <td className="px-4 py-2 text-neutral-600 dark:text-neutral-400">{imp.source}</td>
              <td className="px-4 py-2 text-right tabular-nums">{imp.totalCount ?? "-"}</td>
              <td className="px-4 py-2 text-right tabular-nums text-green-600 dark:text-green-400">{imp.insertedCount ?? 0}</td>
              <td className="px-4 py-2 text-right tabular-nums text-blue-600 dark:text-blue-400">{imp.updatedCount ?? 0}</td>
              <td className="px-4 py-2 text-neutral-500 dark:text-neutral-400">
                {imp.createdAt.toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
