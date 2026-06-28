import { db } from "@/db/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as authSchema from "@/db/auth-schema";
import { business, businessMember } from "@/db/schema";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const businessId = `bus_${crypto.randomUUID()}`;
          const memberId = `mem_${crypto.randomUUID()}`;
          
          await db.insert(business).values({
            id: businessId,
            name: `${user.name}'s Business`,
            slug: `bus-${Date.now()}`,
            ownerId: user.id,
          });
          
          await db.insert(businessMember).values({
            id: memberId,
            businessId: businessId,
            userId: user.id,
            role: "owner",
            acceptedAt: new Date(),
          });
        }
      }
    }
  }
});
