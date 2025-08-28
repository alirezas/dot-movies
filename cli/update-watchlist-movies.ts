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

const updateProgressLine = (message: string) => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(message);
};

const updateMovies = async () => {
  try {
    console.log("🎬 TVDB Watchlist Data Updater\n");

    // Fetch movies that need updating
    const moviesToUpdate = await fetchWatchlistMoviesWithoutTVDBData();

    if (moviesToUpdate.length === 0) {
      console.log("✅ All watchlist movies already have TVDB data!");
      return;
    }

    console.log(`\n🎯 Processing ${moviesToUpdate.length} movies...\n`);

    let updated = 0;
    let failed = 0;

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
        // Log error but continue processing
        console.error(
          `\n❌ Failed to update ${movie.title} (${movie.releaseYear}):`,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    // Clear progress line and show final results
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    console.log("✅ Update Complete!\n");
    console.log(`📊 Results:`);
    console.log(`   Total processed: ${moviesToUpdate.length}`);
    console.log(`   🟢 Updated: ${updated}`);
    console.log(`   🔴 Failed: ${failed}`);
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
