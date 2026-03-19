CREATE TYPE "public"."import_status" AS ENUM('pending', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."log_level" AS ENUM('info', 'warn', 'error');--> statement-breakpoint
CREATE TABLE "import_log_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"import_log_id" integer NOT NULL,
	"level" "log_level" DEFAULT 'info' NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"status" "import_status" DEFAULT 'pending' NOT NULL,
	"source" text NOT NULL,
	"total_count" integer DEFAULT 0,
	"inserted_count" integer DEFAULT 0,
	"updated_count" integer DEFAULT 0,
	"skipped_count" integer DEFAULT 0,
	"error_count" integer DEFAULT 0,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "import_logs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "import_log_entries" ADD CONSTRAINT "import_log_entries_import_log_id_import_logs_id_fk" FOREIGN KEY ("import_log_id") REFERENCES "public"."import_logs"("id") ON DELETE cascade ON UPDATE no action;