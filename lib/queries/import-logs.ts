import { db } from "@/lib/db";
import { importLogEntries, importLogs } from "@/lib/db/schema/import-logs";
import { and, desc, eq, gt } from "drizzle-orm";
import type { ImportLog, ImportLogEntry } from "@/lib/db/schema/import-logs";

export async function getImportLogs(): Promise<ImportLog[]> {
  return db.select().from(importLogs).orderBy(desc(importLogs.createdAt));
}

export async function getImportBySlug(
  slug: string
): Promise<ImportLog | undefined> {
  const results = await db
    .select()
    .from(importLogs)
    .where(eq(importLogs.slug, slug))
    .limit(1);
  return results[0];
}

export async function getImportLogEntries(
  importLogId: number,
  afterId?: number
): Promise<ImportLogEntry[]> {
  const conditions = [eq(importLogEntries.importLogId, importLogId)];
  if (afterId) {
    conditions.push(gt(importLogEntries.id, afterId));
  }

  return db
    .select()
    .from(importLogEntries)
    .where(and(...conditions))
    .orderBy(importLogEntries.id);
}
