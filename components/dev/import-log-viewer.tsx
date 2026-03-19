"use client";

import type { ImportLog, ImportLogEntry } from "@/lib/db/schema/import-logs";
import { useEffect, useRef, useState } from "react";
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

function LevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    info: "text-neutral-500",
    warn: "text-amber-500",
    error: "text-red-500",
  };

  return (
    <span className={`w-12 text-xs font-medium ${styles[level] || styles.info}`}>
      {level.toUpperCase()}
    </span>
  );
}

type Props = {
  initialLog: ImportLog;
  initialEntries: ImportLogEntry[];
  slug: string;
};

export function ImportLogViewer({ initialLog, initialEntries, slug }: Props) {
  const [log, setLog] = useState(initialLog);
  const [entries, setEntries] = useState(initialEntries);
  const logEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  const isActive = log.status === "pending" || log.status === "running";

  // Poll for new entries and auto-scroll
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
          if (autoScrollRef.current && logEndRef.current) {
            setTimeout(() => {
              logEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 50);
          }
        }
        setLog(data.importLog);
      } catch {
        // Silently ignore polling errors
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isActive, slug, entries]);

  // Detect manual scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/dev/import"
          className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          &larr; All imports
        </Link>
        <code className="text-sm font-mono text-neutral-600 dark:text-neutral-400">
          {slug}
        </code>
        <StatusBadge status={log.status} />
      </div>

      <div className="mb-4 grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="text-xs text-neutral-500">Total</div>
          <div className="text-lg font-semibold tabular-nums">{log.totalCount ?? 0}</div>
        </div>
        <div className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="text-xs text-green-600 dark:text-green-400">Inserted</div>
          <div className="text-lg font-semibold tabular-nums text-green-600 dark:text-green-400">
            {log.insertedCount ?? 0}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="text-xs text-blue-600 dark:text-blue-400">Updated</div>
          <div className="text-lg font-semibold tabular-nums text-blue-600 dark:text-blue-400">
            {log.updatedCount ?? 0}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="text-xs text-red-600 dark:text-red-400">Errors</div>
          <div className="text-lg font-semibold tabular-nums text-red-600 dark:text-red-400">
            {log.errorCount ?? 0}
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[500px] overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-950 p-4 font-mono text-xs dark:border-neutral-800"
      >
        {entries.length === 0 && isActive && (
          <div className="text-neutral-500">Waiting for log entries...</div>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="flex gap-3 py-0.5">
            <span className="shrink-0 text-neutral-600">
              {new Date(entry.createdAt).toLocaleTimeString()}
            </span>
            <LevelBadge level={entry.level} />
            <span className={entry.level === "error" ? "text-red-400" : "text-neutral-300"}>
              {entry.message}
            </span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {isActive && (
        <div className="mt-2 text-xs text-neutral-500 animate-pulse">
          Polling for updates...
        </div>
      )}
    </div>
  );
}
