import { eq } from "drizzle-orm";
import JSZip from "jszip";
import { db } from "@/lib/db";
import { importLogEntries, importLogs } from "@/lib/db/schema/import-logs";
import type { ImportLogger } from "./letterboxd";
import {
  loadExistingMovies,
  mergeMovieRecords,
  processImport,
} from "./letterboxd";

function generateSlug(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const id = crypto.randomUUID().slice(0, 8);
  return `${dateStr}-${id}`;
}

function createDbLogger(importLogId: number): ImportLogger {
  return {
    info: async (message: string) => {
      await db.insert(importLogEntries).values({
        importLogId,
        level: "info",
        message,
      });
    },
    warn: async (message: string) => {
      await db.insert(importLogEntries).values({
        importLogId,
        level: "warn",
        message,
      });
    },
    error: async (message: string) => {
      await db.insert(importLogEntries).values({
        importLogId,
        level: "error",
        message,
      });
    },
  };
}

async function extractCsvsFromZip(
  zipBuffer: ArrayBuffer
): Promise<{ watchedCsv: string | null; watchlistCsv: string | null }> {
  const zip = await JSZip.loadAsync(zipBuffer);

  let watchedCsv: string | null = null;
  let watchlistCsv: string | null = null;

  for (const [filename, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    const name = filename.split("/").pop()?.toLowerCase();
    if (name === "watched.csv") {
      watchedCsv = await file.async("string");
    } else if (name === "watchlist.csv") {
      watchlistCsv = await file.async("string");
    }
  }

  return { watchedCsv, watchlistCsv };
}

export async function handleZipImport(
  zipBuffer: ArrayBuffer,
  source: string = "upload"
): Promise<{ slug: string }> {
  const slug = generateSlug();

  // Create the import log record
  const [importLog] = await db
    .insert(importLogs)
    .values({ slug, source, status: "pending" })
    .returning();

  const logger = createDbLogger(importLog.id);

  // Fire-and-forget: run import async (dev-only, Node.js process persists)
  runImport(importLog.id, zipBuffer, logger).catch(async (err) => {
    await logger.error(
      `Fatal: ${err instanceof Error ? err.message : "Unknown error"}`
    );
    await db
      .update(importLogs)
      .set({ status: "failed", completedAt: new Date() })
      .where(eq(importLogs.id, importLog.id));
  });

  return { slug };
}

async function runImport(
  importLogId: number,
  zipBuffer: ArrayBuffer,
  logger: ImportLogger
): Promise<void> {
  // Mark as running
  await db
    .update(importLogs)
    .set({ status: "running" })
    .where(eq(importLogs.id, importLogId));

  await logger.info("Extracting CSV files from zip...");
  const { watchedCsv, watchlistCsv } = await extractCsvsFromZip(zipBuffer);

  if (!watchedCsv && !watchlistCsv) {
    await logger.error("No watched.csv or watchlist.csv found in zip");
    await db
      .update(importLogs)
      .set({ status: "failed", completedAt: new Date() })
      .where(eq(importLogs.id, importLogId));
    return;
  }

  if (watchlistCsv) await logger.info("Found watchlist.csv");
  if (watchedCsv) await logger.info("Found watched.csv");

  await logger.info("Merging movie records...");
  const movieRecords = mergeMovieRecords(watchlistCsv, watchedCsv);
  await logger.info(`Found ${movieRecords.length} unique movies`);

  // Update total count
  await db
    .update(importLogs)
    .set({ totalCount: movieRecords.length })
    .where(eq(importLogs.id, importLogId));

  await logger.info("Loading existing movies from database...");
  const existingMovies = await loadExistingMovies();
  await logger.info(`Found ${existingMovies.size} existing movies in database`);

  await logger.info("Starting import...");
  const results = await processImport(movieRecords, existingMovies, logger);

  await logger.info(
    `Import complete: ${results.inserted} inserted, ${results.updated} updated, ${results.skipped} skipped, ${results.errors} errors`
  );

  // Update final counts and status
  await db
    .update(importLogs)
    .set({
      status: "completed",
      insertedCount: results.inserted,
      updatedCount: results.updated,
      skippedCount: results.skipped,
      errorCount: results.errors,
      completedAt: new Date(),
    })
    .where(eq(importLogs.id, importLogId));
}

export async function handleFetchImport(): Promise<{ slug: string }> {
  const cookies = process.env.LETTERBOXD_COOKIES;
  if (!cookies) {
    throw new Error("LETTERBOXD_COOKIES environment variable is not set");
  }

  const response = await fetch("https://letterboxd.com/data/export/", {
    headers: { Cookie: cookies },
  });

  if (!response.ok) {
    throw new Error(
      `Letterboxd fetch failed: ${response.status} ${response.statusText}`
    );
  }

  const zipBuffer = await response.arrayBuffer();
  return handleZipImport(zipBuffer, "fetch");
}
