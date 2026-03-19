import { parse } from "csv-parse/sync";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema/movies";

export type MovieRecord = {
  title: string;
  releaseYear: number | null;
  letterboxdUrl: string | null;
  watchedDate: string | null;
};

export type ExistingMovie = {
  id: number;
  watchedDate: string | null;
  letterboxdUrl: string | null;
};

export type ImportLogger = {
  info: (message: string) => Promise<void> | void;
  warn: (message: string) => Promise<void> | void;
  error: (message: string) => Promise<void> | void;
};

export function parseCsvContent(content: string): MovieRecord[] {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  // biome-ignore lint/suspicious/noExplicitAny: CSV records are untyped
  return records.map((record: any) => {
    const year = record.Year || record.year;
    const parsedYear = year ? parseInt(year, 10) : NaN;
    return {
      title: record.Name || record.name,
      releaseYear: Number.isNaN(parsedYear) ? null : parsedYear,
      letterboxdUrl:
        record["Letterboxd URI"] || record.letterboxd_uri || record.uri,
      watchedDate: record.Date || record.date || null,
    };
  });
}

export function mergeMovieRecords(
  watchlistCsv: string | null,
  watchedCsv: string | null
): MovieRecord[] {
  const mergedMap = new Map<string, MovieRecord>();

  if (watchlistCsv) {
    const watchlistMovies = parseCsvContent(watchlistCsv);
    for (const movie of watchlistMovies) {
      const key = `${movie.title}|${movie.releaseYear ?? "null"}`;
      mergedMap.set(key, { ...movie, watchedDate: null });
    }
  }

  if (watchedCsv) {
    const watchedMovies = parseCsvContent(watchedCsv);
    for (const movie of watchedMovies) {
      const key = `${movie.title}|${movie.releaseYear ?? "null"}`;
      mergedMap.set(key, { ...movie, watchedDate: movie.watchedDate || null });
    }
  }

  return Array.from(mergedMap.values());
}

export async function loadExistingMovies(): Promise<Map<string, ExistingMovie>> {
  const existing = await db
    .select({
      id: movies.id,
      title: movies.title,
      releaseYear: movies.releaseYear,
      watchedDate: movies.watchedDate,
      letterboxdUrl: movies.letterboxdUrl,
    })
    .from(movies);

  const movieMap = new Map<string, ExistingMovie>();
  for (const movie of existing) {
    const key = `${movie.title}|${movie.releaseYear ?? "null"}`;
    movieMap.set(key, {
      id: movie.id,
      watchedDate: movie.watchedDate,
      letterboxdUrl: movie.letterboxdUrl,
    });
  }

  return movieMap;
}

export async function processImport(
  movieRecords: MovieRecord[],
  existingMovies: Map<string, ExistingMovie>,
  logger: ImportLogger
): Promise<{ inserted: number; updated: number; skipped: number; errors: number }> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < movieRecords.length; i++) {
    const movie = movieRecords[i];
    const movieKey = `${movie.title}|${movie.releaseYear ?? "null"}`;
    const existing = existingMovies.get(movieKey);

    try {
      if (existing) {
        const watchedDateChanged = existing.watchedDate !== movie.watchedDate;
        const letterboxdUrlChanged = existing.letterboxdUrl !== movie.letterboxdUrl;

        if (watchedDateChanged || letterboxdUrlChanged) {
          await db
            .update(movies)
            .set({
              watchedDate: movie.watchedDate,
              letterboxdUrl: movie.letterboxdUrl,
              updatedAt: new Date(),
            })
            .where(eq(movies.id, existing.id));

          existingMovies.set(movieKey, {
            id: existing.id,
            watchedDate: movie.watchedDate,
            letterboxdUrl: movie.letterboxdUrl,
          });

          updated++;
          await logger.info(
            `Updated: ${movie.title} (${movie.releaseYear ?? "N/A"})`
          );
        } else {
          skipped++;
        }
      } else {
        await db.insert(movies).values({
          title: movie.title,
          releaseYear: movie.releaseYear,
          letterboxdUrl: movie.letterboxdUrl,
          watchedDate: movie.watchedDate,
        });

        inserted++;
        await logger.info(
          `Inserted: ${movie.title} (${movie.releaseYear ?? "N/A"})`
        );
      }
    } catch (err) {
      errors++;
      await logger.error(
        `Failed: ${movie.title} (${movie.releaseYear ?? "N/A"}) - ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }

    // Log progress every 50 movies
    if ((i + 1) % 50 === 0) {
      await logger.info(`Progress: ${i + 1}/${movieRecords.length} processed`);
    }
  }

  return { inserted, updated, skipped, errors };
}
