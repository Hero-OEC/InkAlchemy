import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use Supabase database URL
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres.nkmtcxeahydditymadlw:123qweasdZXCrakan@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create the connection
const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });