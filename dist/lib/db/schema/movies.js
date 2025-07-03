"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movies = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
exports.movies = (0, pg_core_1.pgTable)("movies", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    releaseYear: (0, pg_core_1.integer)("release_year"),
    letterboxdUrl: (0, pg_core_1.text)("letterboxd_url"),
    watchedDate: (0, pg_core_1.date)("watched_date").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
