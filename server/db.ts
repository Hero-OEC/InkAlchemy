import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use the DATABASE_URL which should contain the correct Supabase connection string
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

console.log('Connecting to database:', databaseUrl.includes('supabase') ? 'Supabase' : 'Other');

// Create the connection
const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });