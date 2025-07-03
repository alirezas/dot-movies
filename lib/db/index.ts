import { neon, neonConfig } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Load environment variables from .env file
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

neonConfig.fetchConnectionCache = true;
const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });

// Helper to get typed results
export type DbClient = typeof db;
