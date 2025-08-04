import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use the DATABASE_URL from Supabase PostgreSQL - force Supabase connection
const supabaseUrl = "postgresql://postgres.nkmtcxeahydditymadlw:123qweasdZXCrakan@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";
const databaseUrl = supabaseUrl;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

console.log('Connecting to database: Supabase PostgreSQL');

// Create the connection
const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });