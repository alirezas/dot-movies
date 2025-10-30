#!/usr/bin/env node

import { Command } from "commander";
import { and, isNull } from "drizzle-orm";
import { updateMovieData } from "../actions/update-movie-data";
import { db } from "../lib/db/index";
import { type Movie, movies } from "../lib/db/schema/movies";

const fetchWatchlistMoviesWithoutTVDBData = async (): Promise<Movie[]> => {
  console.log("🔍 Fetching watchlist movies without TVDB data...");

  const watchlistMovies = await db
    .select()
    .from(movies)
    .where(
      // Movie is in watchlist (no watchedDate) but doesn't have tvdbData
      and(isNull(movies.watchedDate), isNull(movies.tvdbData))
    );

  console.log(
    `📚 Found ${watchlistMovies.length} watchlist movies without TVDB data`
  );
  return watchlistMovies;
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

const clearTerminal = () => {
  process.stdout.write("\x1B[2J\x1B[0f");
};

let errorLinesCount = 0;

const writeErrorBelow = (message: string) => {
  // Write error on a new line below progress bar
  process.stdout.write(`\n${message}`);
  errorLinesCount++;
};

const getProgressBarPosition = () => {
  // Move cursor up by number of error lines to get back to progress bar line
  if (errorLinesCount > 0) {
    process.stdout.write(`\x1B[${errorLinesCount}A`);
  }
};

const updateProgressLine = (message: string) => {
  // Move back to progress bar line if errors were written
  getProgressBarPosition();

  if (
    typeof process.stdout.clearLine === "function" &&
    typeof process.stdout.cursorTo === "function"
  ) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
  process.stdout.write(message);

  // Move back down to end of output
  if (errorLinesCount > 0) {
    process.stdout.write(`\x1B[${errorLinesCount}B`);
  }
};

const updateMovies = async () => {
  try {
    clearTerminal();
    console.log("🎬 TVDB Watchlist Data Updater\n");

    // Fetch movies that need updating
    const moviesToUpdate = await fetchWatchlistMoviesWithoutTVDBData();

    if (moviesToUpdate.length === 0) {
      console.log("✅ All watchlist movies already have TVDB data!");
      return;
    }

    console.log(`🎯 Processing ${moviesToUpdate.length} movies...\n`);

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];
    errorLinesCount = 0; // Reset error line counter

    // Process each movie
    for (let i = 0; i < moviesToUpdate.length; i++) {
      const movie = moviesToUpdate[i];

      const progressBar = createProgressBar(i + 1, moviesToUpdate.length);
      updateProgressLine(
        `${progressBar} - ${movie.title} (${movie.releaseYear})`
      );

      try {
        await updateMovieData(movie, movie.id);
        updated++;

        // Small delay to make progress visible and avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        failed++;
        const errorMsg = `❌ Failed to update ${movie.title} (${movie.releaseYear}): ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        errors.push(errorMsg);
        // Write error below progress bar
        writeErrorBelow(errorMsg);
      }
    }

    // Clear progress line and show final results
    if (
      typeof process.stdout.clearLine === "function" &&
      typeof process.stdout.cursorTo === "function"
    ) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
    } else {
      process.stdout.write("\n");
    }

    console.log("\n✅ Update Complete!");
    console.log(`📊 Results:`);
    console.log(`   Total processed: ${moviesToUpdate.length}`);
    console.log(`   🟢 Updated: ${updated}`);
    console.log(`   🔴 Failed: ${failed}`);

    if (errors.length > 0) {
      console.log(`\n❌ Errors:\n${errors.join("\n")}`);
    }
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
  .name("update-watchlist-movies")
  .description("Update watchlist movies with TVDB data")
  .version("1.0.0")
  .action(() => {
    updateMovies();
  });

program.parse(process.argv);
