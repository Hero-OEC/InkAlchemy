import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use Supabase PostgreSQL database URL
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required");
}

// Extract the database URL from Supabase URL
// Convert from https://project.supabase.co to postgresql://postgres:[password]@db.project.supabase.co:5432/postgres
const projectRef = supabaseUrl.split('//')[1].split('.')[0];
const supabaseDbUrl = `postgresql://postgres:${supabaseServiceKey}@db.${projectRef}.supabase.co:5432/postgres`;

console.log('Connecting to Supabase database:', projectRef);

// Create the connection
const client = postgres(supabaseDbUrl);
export const db = drizzle(client, { schema });