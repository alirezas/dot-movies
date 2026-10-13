#!/usr/bin/env node

import "./utils"; // Load .env before anything else
import { Command } from "commander";
import { db } from "../lib/db/index";
import { people } from "../lib/db/schema/people";
import {
  fetchPersonProfile,
  isProfileStale,
  savePersonProfile,
} from "../lib/people/profile";
import {
  clearProgressLine,
  clearTerminal,
  createProgressBar,
  resetErrorCount,
  updateProgressLine,
  writeErrorBelow,
} from "./utils";

const updatePeople = async (options: { limit?: number }) => {
  try {
    clearTerminal();
    console.log("🎭 TVDB People Profile Updater\n");
    console.log("🔍 Fetching people with missing or stale profiles...");

    const stale = (await db.select().from(people)).filter(isProfileStale);
    const toUpdate = options.limit ? stale.slice(0, options.limit) : stale;

    console.log(`📚 Found ${stale.length} people to update\n`);

    if (toUpdate.length === 0) {
      console.log("✅ All profiles are up to date!");
      return;
    }

    let updated = 0;
    let failed = 0;
    resetErrorCount();

    for (let i = 0; i < toUpdate.length; i++) {
      const person = toUpdate[i];
      updateProgressLine(
        `${createProgressBar(i + 1, toUpdate.length)} - ${person.name}`
      );

      try {
        const profile = await fetchPersonProfile(person.id);
        if (!profile) throw new Error("No TVDB record");
        await savePersonProfile(person.id, profile);
        updated++;

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        failed++;
        writeErrorBelow(
          `❌ Failed to update ${person.name} (${person.id}): ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    clearProgressLine();

    console.log("\n✅ Update Complete!");
    console.log(`📊 Results:`);
    console.log(`   Total processed: ${toUpdate.length}`);
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
  .name("update-people")
  .description("Fetch TVDB profiles for people with missing or stale data")
  .version("1.0.0")
  .option("-l, --limit <n>", "only update the first n people", Number)
  .action(async (options) => {
    await updatePeople(options);
  });

program.parse(process.argv);
