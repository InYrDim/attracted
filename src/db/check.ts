import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { business, businessMember } from "./schema";
import { eq } from "drizzle-orm";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function check() {
  const b = await db.select().from(business).where(eq(business.ownerId, "CktkkKV6SX8lPwyTdqcrKdKSiV6tE7gk"));
  const m = await db.select().from(businessMember).where(eq(businessMember.userId, "CktkkKV6SX8lPwyTdqcrKdKSiV6tE7gk"));
  
  console.log("Business created:", b);
  console.log("Member created:", m);
  process.exit(0);
}
check();
