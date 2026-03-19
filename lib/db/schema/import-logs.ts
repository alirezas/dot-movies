import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const importStatusEnum = pgEnum("import_status", [
  "pending",
  "running",
  "completed",
  "failed",
]);

export const importLogs = pgTable("import_logs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  status: importStatusEnum("status").notNull().default("pending"),
  source: text("source").notNull(),
  totalCount: integer("total_count").default(0),
  insertedCount: integer("inserted_count").default(0),
  updatedCount: integer("updated_count").default(0),
  skippedCount: integer("skipped_count").default(0),
  errorCount: integer("error_count").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ImportLog = typeof importLogs.$inferSelect;

export const logLevelEnum = pgEnum("log_level", ["info", "warn", "error"]);

export const importLogEntries = pgTable("import_log_entries", {
  id: serial("id").primaryKey(),
  importLogId: integer("import_log_id")
    .notNull()
    .references(() => importLogs.id, { onDelete: "cascade" }),
  level: logLevelEnum("level").notNull().default("info"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ImportLogEntry = typeof importLogEntries.$inferSelect;
