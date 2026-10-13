#!/usr/bin/env node

import "./utils"; // Load .env before anything else
import { Command } from "commander";
import { isNotNull } from "drizzle-orm";
import { db } from "../lib/db/index";
import { movies } from "../lib/db/schema/movies";
import { syncMovieCredits } from "../lib/people/credits";
import {
  clearProgressLine,
  clearTerminal,
  createProgressBar,
  resetErrorCount,
  updateProgressLine,
  writeErrorBelow,
} from "./utils";

const backfillPeople = async () => {
  try {
    clearTerminal();
    console.log("🎭 People Backfill\n");
    console.log("🔍 Fetching movies with TVDB data...");

    const moviesWithData = await db
      .select({
        id: movies.id,
        title: movies.title,
        releaseYear: movies.releaseYear,
        tvdbData: movies.tvdbData,
      })
      .from(movies)
      .where(isNotNull(movies.tvdbData));

    console.log(`📚 Found ${moviesWithData.length} movies\n`);

    let credits = 0;
    let failed = 0;
    resetErrorCount();

    for (let i = 0; i < moviesWithData.length; i++) {
      const movie = moviesWithData[i];
      updateProgressLine(
        `${createProgressBar(i + 1, moviesWithData.length)} - ${movie.title} (${movie.releaseYear})`
      );

      try {
        credits += await syncMovieCredits(movie.id, movie.tvdbData);
      } catch (error) {
        failed++;
        writeErrorBelow(
          `❌ Failed to sync ${movie.title} (${movie.releaseYear}): ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    clearProgressLine();

    console.log("\n✅ Backfill Complete!");
    console.log(`📊 Results:`);
    console.log(`   Movies processed: ${moviesWithData.length}`);
    console.log(`   🟢 Credits synced: ${credits}`);
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
  .name("backfill-people")
  .description("Populate people and credits from stored TVDB movie data")
  .version("1.0.0")
  .action(async () => {
    await backfillPeople();
  });

program.parse(process.argv);
