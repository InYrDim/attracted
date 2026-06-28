"use server";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // Check if __drizzle_migrations exists
  const result = await sql`SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = '__drizzle_migrations'
  )`;
  const exists = result[0]?.exists;

  if (!exists) {
    console.log("Creating __drizzle_migrations tracking table...");

    // Create the migration tracking table
    await sql`CREATE TABLE "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )`;

    // Seed it with the 3 already-applied migrations (use hash from each file)
    // For simplicity, hash = the migration number. drizzle-kit checks hash + sequence.
    const appliedMigrations = [
      { hash: "0000_warm_goliath", created_at: Date.now() - 3600000 * 3 },
      { hash: "0001_stiff_sabra", created_at: Date.now() - 3600000 * 2 },
      { hash: "0002_cheerful_vector", created_at: Date.now() - 3600000 },
    ];

    for (const m of appliedMigrations) {
      await sql`INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES (${m.hash}, ${m.created_at})`;
    }

    console.log("✅ Tracking table seeded. Now run `bun run db:migrate` to apply 0003.");
  } else {
    console.log("✅ __drizzle_migrations already exists. Check status with `bun run db:migrate`.");
  }
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
