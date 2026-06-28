import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

config({ path: ".env" }); // or .env.local

export const db = drizzle(process.env.DATABASE_URL!, { schema: { ...schema, ...authSchema } });
