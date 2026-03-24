"use client";

import type { ImportLog, ImportLogEntry } from "@/lib/db/schema/import-logs";
import { CheckCircle, CircleAlert, CircleDot, Info, Loader2, SkipForward } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    pending: {
      icon: <CircleDot className="size-3.5" />,
      label: "Pending",
      className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
    },
    running: {
      icon: <Loader2 className="size-3.5 animate-spin" />,
      label: "In progress",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    completed: {
      icon: <CheckCircle className="size-3.5" />,
      label: "Completed",
      className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
    failed: {
      icon: <CircleAlert className="size-3.5" />,
      label: "Failed",
      className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    },
  };

  const c = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.className}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

function parseEntry(entry: ImportLogEntry) {
  const msg = entry.message;

  const yr = String.raw`(\d{4}|N/A)`;

  const addedMatch = msg.match(new RegExp(`^Added (.+) \\(${yr}\\)$`));
  if (addedMatch) return { title: addedMatch[1], year: addedMatch[2], status: "added" as const, detail: null };

  const updatedMatch = msg.match(new RegExp(`^Updated (.+) \\(${yr}\\) — (.+)$`));
  if (updatedMatch) return { title: updatedMatch[1], year: updatedMatch[2], status: "updated" as const, detail: updatedMatch[3] };

  const failedMatch = msg.match(new RegExp(`^Failed (.+) \\(${yr}\\) — (.+)$`));
  if (failedMatch) return { title: failedMatch[1], year: failedMatch[2], status: "failed" as const, detail: failedMatch[3] };

  const skippedMatch = msg.match(new RegExp(`^Skipped (.+) \\(${yr}\\)$`));
  if (skippedMatch) return { title: skippedMatch[1], year: skippedMatch[2], status: "skipped" as const, detail: null };

  const loadingMatch = msg.match(new RegExp(`^Loading (.+) \\(${yr}\\)$`));
  if (loadingMatch) return { title: loadingMatch[1], year: loadingMatch[2], status: "loading" as const, detail: null };

  return null;
}

const entryStatusConfig = {
  added: { icon: <CheckCircle className="size-4 text-green-500" /> },
  updated: { icon: <Info className="size-4 text-blue-500" /> },
  failed: { icon: <CircleAlert className="size-4 text-red-500" /> },
  skipped: { icon: <SkipForward className="size-4 text-neutral-400" /> },
  loading: { icon: <Loader2 className="size-4 animate-spin text-neutral-400" /> },
};

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

type Props = {
  initialLog: ImportLog;
  initialEntries: ImportLogEntry[];
  slug: string;
};

type Filter = "all" | "added" | "updated" | "failed" | "skipped";

export function ImportLogViewer({ initialLog, initialEntries, slug }: Props) {
  const [log, setLog] = useState(initialLog);
  const [entries, setEntries] = useState(initialEntries);
  const [filter, setFilter] = useState<Filter>("all");
  const containerRef = useRef<HTMLDivElement>(null);

  const isActive = log.status === "pending" || log.status === "running";
  const total = log.totalCount ?? 0;
  const done = (log.insertedCount ?? 0) + (log.updatedCount ?? 0) + (log.skippedCount ?? 0) + (log.errorCount ?? 0);
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  // Collapse "Loading" entries that have a resolved follow-up
  const resolvedMovies = new Set<string>();
  for (const entry of entries) {
    const parsed = parseEntry(entry);
    if (parsed && parsed.status !== "loading") {
      resolvedMovies.add(`${parsed.title}|${parsed.year}`);
    }
  }

  const reversedEntries = [...entries].reverse();

  const filteredEntries = reversedEntries.filter((entry) => {
    const parsed = parseEntry(entry);
    // Hide loading entries for movies that already have a result
    if (parsed?.status === "loading" && resolvedMovies.has(`${parsed.title}|${parsed.year}`)) {
      return false;
    }
    if (filter === "all") return true;
    if (!parsed) return false;
    if (parsed.status === "loading") return true;
    return parsed.status === filter;
  });

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(async () => {
      const lastId = entries.length > 0 ? entries[entries.length - 1].id : 0;
      try {
        const res = await fetch(`/api/dev/import/${slug}/logs?after=${lastId}`);
        if (!res.ok) return;

        const data = await res.json();
        if (data.entries.length > 0) {
          setEntries((prev) => [...prev, ...data.entries]);
        }
        setLog(data.importLog);
      } catch {
        // Silently ignore polling errors
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isActive, slug, entries]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dev/import"
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            &larr; Back
          </Link>
          <StatusBadge status={log.status} />
        </div>
        <span className="text-xs text-neutral-400">
          {formatTime(log.createdAt)}
        </span>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {isActive ? "Importing movies..." : `${done} of ${total} movies processed`}
            </span>
            <span className="text-sm tabular-nums text-neutral-500">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                log.status === "failed"
                  ? "bg-red-500"
                  : log.status === "completed"
                    ? "bg-green-500"
                    : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats — clickable filters */}
      <div className="grid grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setFilter(filter === "all" ? "all" : "all")}
          className={`rounded-lg border px-4 py-3 text-left transition-colors ${
            filter === "all"
              ? "border-neutral-400 ring-1 ring-neutral-400 dark:border-neutral-500 dark:ring-neutral-500"
              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
          }`}
        >
          <div className="text-xs text-neutral-500">Total</div>
          <div className="text-lg font-semibold tabular-nums">{total}</div>
        </button>
        <button
          type="button"
          onClick={() => setFilter(filter === "added" ? "all" : "added")}
          className={`rounded-lg border px-4 py-3 text-left transition-colors ${
            filter === "added"
              ? "border-green-500 ring-1 ring-green-500"
              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
          }`}
        >
          <div className="text-xs text-green-600 dark:text-green-400">Added</div>
          <div className="text-lg font-semibold tabular-nums text-green-600 dark:text-green-400">
            {log.insertedCount ?? 0}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setFilter(filter === "updated" ? "all" : "updated")}
          className={`rounded-lg border px-4 py-3 text-left transition-colors ${
            filter === "updated"
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
          }`}
        >
          <div className="text-xs text-blue-600 dark:text-blue-400">Updated</div>
          <div className="text-lg font-semibold tabular-nums text-blue-600 dark:text-blue-400">
            {log.updatedCount ?? 0}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setFilter(filter === "skipped" ? "all" : "skipped")}
          className={`rounded-lg border px-4 py-3 text-left transition-colors ${
            filter === "skipped"
              ? "border-neutral-400 ring-1 ring-neutral-400"
              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
          }`}
        >
          <div className="text-xs text-neutral-500">Skipped</div>
          <div className="text-lg font-semibold tabular-nums text-neutral-500">
            {log.skippedCount ?? 0}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setFilter(filter === "failed" ? "all" : "failed")}
          className={`rounded-lg border px-4 py-3 text-left transition-colors ${
            filter === "failed"
              ? "border-red-500 ring-1 ring-red-500"
              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
          }`}
        >
          <div className="text-xs text-red-600 dark:text-red-400">Errors</div>
          <div className="text-lg font-semibold tabular-nums text-red-600 dark:text-red-400">
            {log.errorCount ?? 0}
          </div>
        </button>
      </div>

      {/* Movie list */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Movies
        </h3>
        <div ref={containerRef}>
          {entries.length === 0 && isActive && (
            <div className="flex items-center gap-2 p-4 text-sm text-neutral-500">
              <Loader2 className="size-4 animate-spin" />
              Waiting for movies...
            </div>
          )}
          {filteredEntries.map((entry, i) => {
            const parsed = parseEntry(entry);
            const isLast = i === filteredEntries.length - 1;
            const borderClass = !isLast ? "border-b border-neutral-100 dark:border-neutral-800/50" : "";

            if (!parsed) {
              return (
                <div
                  key={`${entry.id}-${i}`}
                  className={`flex items-center gap-3 px-4 py-2.5 ${borderClass}`}
                >
                  <Info className="size-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
                  <span className="text-xs text-neutral-500">{entry.message}</span>
                </div>
              );
            }

            const config = entryStatusConfig[parsed.status];

            return (
              <div
                key={`${entry.id}-${i}`}
                className={`flex items-center gap-3 px-4 py-3 ${borderClass}`}
              >
                {config.icon}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {parsed.title}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {parsed.year}
                    </span>
                  </div>
                  {parsed.detail && (
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {parsed.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isActive && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Loader2 className="size-3 animate-spin" />
          Checking for updates...
        </div>
      )}
    </div>
  );
}
