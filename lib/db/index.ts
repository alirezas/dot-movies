import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Next.js and Vercel handle .env loading automatically.
// CLI scripts load env via dotenv in their own entry points.
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });

// Helper to get typed results
export type DbClient = typeof db;
