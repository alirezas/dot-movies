#!/usr/bin/env node

import { Command } from "commander";
import { parse } from "csv-parse/sync";
import { eq } from "drizzle-orm";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "../lib/db/index";
import { movies } from "../lib/db/schema/movies";
import { createProgressBar, updateProgressLine } from "./utils";

type MovieRecord = {
  title: string;
  releaseYear: number | null;
  letterboxdUrl: string | null;
  watchedDate: string | null;
};

const parseCsvFile = (filePath: string): MovieRecord[] => {
  try {
    const content = readFileSync(filePath, "utf-8");
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // biome-ignore lint/suspicious/noExplicitAny: not fixable
    return records.map((record: any) => {
      const year = record.Year || record.year;
      const parsedYear = year ? parseInt(year, 10) : NaN;
      return {
        title: record.Name || record.name,
        releaseYear: Number.isNaN(parsedYear) ? null : parsedYear,
        letterboxdUrl:
          record["Letterboxd URI"] || record.letterboxd_uri || record.uri,
        watchedDate: record.Date || record.date,
      };
    });
  } catch (err) {
    throw new Error(`Failed to parse CSV file ${filePath}: ${err}`);
  }
};

type ExistingMovie = {
  id: number;
  watchedDate: string | null;
  letterboxdUrl: string | null;
};

const loadExistingMovies = async (): Promise<Map<string, ExistingMovie>> => {
  try {
    console.log("🔍 Loading existing movies from database...");
    const existing = await db
      .select({
        id: movies.id,
        title: movies.title,
        releaseYear: movies.releaseYear,
        watchedDate: movies.watchedDate,
        letterboxdUrl: movies.letterboxdUrl,
      })
      .from(movies);

    // Create a Map with "title|year" format for fast lookups
    const movieMap = new Map<string, ExistingMovie>();
    for (const movie of existing) {
      const key = `${movie.title}|${movie.releaseYear ?? "null"}`;
      movieMap.set(key, {
        id: movie.id,
        watchedDate: movie.watchedDate,
        letterboxdUrl: movie.letterboxdUrl,
      });
    }

    console.log(`📚 Found ${existing.length} existing movies in database`);
    return movieMap;
  } catch (err) {
    console.error("Error loading existing movies:", err);
    return new Map();
  }
};

const insertMovie = async (movie: MovieRecord): Promise<boolean> => {
  try {
    await db.insert(movies).values({
      title: movie.title,
      releaseYear: movie.releaseYear,
      letterboxdUrl: movie.letterboxdUrl,
      watchedDate: movie.watchedDate,
    });
    return true;
  } catch (err) {
    console.error(`Error inserting movie ${movie.title}:`, err);
    return false;
  }
};

const updateMovie = async (
  movieId: number,
  watchedDate: string | null,
  letterboxdUrl: string | null
): Promise<boolean> => {
  try {
    await db
      .update(movies)
      .set({
        watchedDate,
        letterboxdUrl,
        updatedAt: new Date(),
      })
      .where(eq(movies.id, movieId));
    return true;
  } catch (err) {
    console.error(`Error updating movie with ID ${movieId}:`, err);
    return false;
  }
};


const importData = async (directory: string) => {
  try {
    console.log("🎬 Letterboxd Import Tool\n");

    // Load existing movies from database once
    const existingMovies = await loadExistingMovies();
    console.log();

    // Validate directory
    if (!existsSync(directory)) {
      console.error(`❌ Directory does not exist: ${directory}`);
      process.exit(1);
    }

    const watchedFile = join(directory, "watched.csv");
    const watchlistFile = join(directory, "watchlist.csv");

    // Check if files exist
    const watchedExists = existsSync(watchedFile);
    const watchlistExists = existsSync(watchlistFile);

    if (!watchedExists && !watchlistExists) {
      console.error(
        "❌ Neither watched.csv nor watchlist.csv found in directory"
      );
      process.exit(1);
    }

    // Parse and merge CSV files
    const mergedMoviesMap = new Map<string, MovieRecord>();

    // First, load all watchlist movies (watchedDate = null)
    if (watchlistExists) {
      console.log("📖 Parsing watchlist.csv...");
      const watchlistMovies = parseCsvFile(watchlistFile);
      for (const movie of watchlistMovies) {
        const key = `${movie.title}|${movie.releaseYear ?? "null"}`;
        mergedMoviesMap.set(key, {
          ...movie,
          watchedDate: null,
        });
      }
      console.log(`✅ Found ${watchlistMovies.length} watchlist movies`);
    }

    // Then, add/update with watched movies (watchedDate from CSV)
    if (watchedExists) {
      console.log("📖 Parsing watched.csv...");
      const watchedMovies = parseCsvFile(watchedFile);
      for (const movie of watchedMovies) {
        const key = `${movie.title}|${movie.releaseYear ?? "null"}`;
        mergedMoviesMap.set(key, {
          ...movie,
          watchedDate: movie.watchedDate || null,
        });
      }
      console.log(`✅ Found ${watchedMovies.length} watched movies`);
    }

    // Convert Map to array
    const uniqueMovies = Array.from(mergedMoviesMap.values());

    console.log(`\n🎯 Processing ${uniqueMovies.length} unique movies...\n`);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    // Process each movie
    for (let i = 0; i < uniqueMovies.length; i++) {
      const movie = uniqueMovies[i];
      const movieKey = `${movie.title}|${movie.releaseYear ?? "null"}`;

      const progressBar = createProgressBar(i + 1, uniqueMovies.length);
      updateProgressLine(
        `${progressBar} - ${movie.title} (${movie.releaseYear ?? "N/A"})`
      );

      // Check if movie already exists
      const existingMovie = existingMovies.get(movieKey);

      if (existingMovie) {
        // Movie exists - check if update is needed
        const watchedDateChanged =
          existingMovie.watchedDate !== movie.watchedDate;
        const letterboxdUrlChanged =
          existingMovie.letterboxdUrl !== movie.letterboxdUrl;

        if (watchedDateChanged || letterboxdUrlChanged) {
          const success = await updateMovie(
            existingMovie.id,
            movie.watchedDate,
            movie.letterboxdUrl
          );
          if (success) {
            updated++;
            // Update the in-memory map to reflect the change
            existingMovies.set(movieKey, {
              id: existingMovie.id,
              watchedDate: movie.watchedDate,
              letterboxdUrl: movie.letterboxdUrl,
            });
          } else {
            skipped++;
          }
        } else {
          skipped++;
        }
      } else {
        // Movie doesn't exist - insert it
        const success = await insertMovie(movie);
        if (success) {
          inserted++;
        } else {
          skipped++;
        }
      }

      // Small delay to make progress visible
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Clear progress line and show final results
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    console.log("✅ Import Complete!\n");
    console.log(`📊 Results:`);
    console.log(`   Total processed: ${uniqueMovies.length}`);
    console.log(`   🟢 Inserted: ${inserted}`);
    console.log(`   🔵 Updated: ${updated}`);
    console.log(`   🟡 Skipped (no changes): ${skipped}`);
  } catch (err) {
    console.error(
      "\n❌ Error:",
      err instanceof Error ? err.message : "Unknown error occurred"
    );
    process.exit(1);
  }
};

const program = new Command();

program
  .name("import-letterboxd")
  .description("Import Letterboxd exported data into movies database")
  .version("1.0.0")
  .argument(
    "<directory>",
    "Path to directory containing watched.csv and/or watchlist.csv"
  )
  .action(async (directory: string) => {
    await importData(directory);
  });

program.parse(process.argv);
