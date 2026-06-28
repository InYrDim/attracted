import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  await sql`ALTER TABLE "automation_rule" ADD COLUMN IF NOT EXISTS "name" text`;
  await sql`ALTER TABLE "business" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT false NOT NULL`;
  await sql`ALTER TABLE "business" ADD COLUMN IF NOT EXISTS "onboarding_data" jsonb DEFAULT '{}'::jsonb NOT NULL`;
  console.log("✅ Migration applied: 3 columns added");
}

run().catch((e) => { console.error("❌", e); process.exit(1); });
