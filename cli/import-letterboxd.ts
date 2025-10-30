#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import { parse } from "csv-parse/sync";
import { db } from "../lib/db/index";
import { type Movie, movies } from "../lib/db/schema/movies";

type MovieRecord = Movie;

const parseCsvFile = (filePath: string): MovieRecord[] => {
  try {
    const content = readFileSync(filePath, "utf-8");
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // biome-ignore lint/suspicious/noExplicitAny: not fixable
    return records.map((record: any) => ({
      title: record.Name || record.name,
      releaseYear: parseInt(record.Year || record.year, 10),
      letterboxdUrl:
        record["Letterboxd URI"] || record.letterboxd_uri || record.uri,
      watchedDate: record.Date || record.date,
    }));
  } catch (err) {
    throw new Error(`Failed to parse CSV file ${filePath}: ${err}`);
  }
};

const loadExistingMovies = async (): Promise<Set<string>> => {
  try {
    console.log("🔍 Loading existing movies from database...");
    const existing = await db
      .select({
        title: movies.title,
        releaseYear: movies.releaseYear,
      })
      .from(movies);

    // Create a Set with "title|year" format for fast lookups
    const movieKeys = new Set<string>(
      existing.map(
        (movie: { title: string; releaseYear: number | null }) =>
          `${movie.title}|${movie.releaseYear}`
      )
    );

    console.log(`📚 Found ${existing.length} existing movies in database`);
    return movieKeys;
  } catch (err) {
    console.error("Error loading existing movies:", err);
    return new Set();
  }
};

const checkIfMovieExists = (
  title: string,
  year: number,
  existingMovies: Set<string>
): boolean => {
  return existingMovies.has(`${title}|${year}`);
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

const createProgressBar = (
  current: number,
  total: number,
  width: number = 40
): string => {
  const percentage = Math.round((current / total) * 100);
  const filledWidth = Math.round((current / total) * width);
  const emptyWidth = width - filledWidth;

  const filledBar = "█".repeat(filledWidth);
  const emptyBar = "░".repeat(emptyWidth);

  return `[${filledBar}${emptyBar}] ${percentage}% (${current}/${total})`;
};

const updateProgressLine = (message: string) => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(message);
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

    const allMovies: MovieRecord[] = [];

    // Parse watched.csv
    if (watchedExists) {
      console.log("📖 Parsing watched.csv...");
      const watchedMovies = parseCsvFile(watchedFile);
      allMovies.push(...watchedMovies);
      console.log(`✅ Found ${watchedMovies.length} watched movies`);
    }

    // Parse watchlist.csv
    if (watchlistExists) {
      console.log("📖 Parsing watchlist.csv...");
      const watchlistMovies = parseCsvFile(watchlistFile);
      // For watchlist movies, watchedDate should be null since they haven't been watched
      const processedWatchlist = watchlistMovies.map((movie) => ({
        ...movie,
        watchedDate: null,
      }));
      allMovies.push(...processedWatchlist);
      console.log(`✅ Found ${watchlistMovies.length} watchlist movies`);
    }

    // Remove duplicates within the CSV data itself
    const uniqueMovies = allMovies.filter(
      (movie, index, arr) =>
        arr.findIndex(
          (m) => m.title === movie.title && m.releaseYear === movie.releaseYear
        ) === index
    );

    console.log(`\n🎯 Processing ${uniqueMovies.length} unique movies...\n`);

    let inserted = 0;
    let skipped = 0;

    // Process each movie
    for (let i = 0; i < uniqueMovies.length; i++) {
      const movie = uniqueMovies[i];

      const progressBar = createProgressBar(i + 1, uniqueMovies.length);
      updateProgressLine(
        `${progressBar} - ${movie.title} (${movie.releaseYear})`
      );

      // Check if movie already exists (fast in-memory lookup)
      const exists = checkIfMovieExists(
        movie.title,
        movie.releaseYear ?? 0,
        existingMovies
      );

      if (exists) {
        skipped++;
      } else {
        const success = await insertMovie(movie);
        if (success) {
          inserted++;
          // Add to existing movies set to prevent duplicates within this import session
          existingMovies.add(`${movie.title}|${movie.releaseYear}`);
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
    console.log(`   🟡 Skipped (already exists): ${skipped}`);
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
  .action((directory: string) => {
    importData(directory);
  });

program.parse(process.argv);
