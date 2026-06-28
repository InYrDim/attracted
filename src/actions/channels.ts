"use server";
import { db } from "@/db/drizzle";
import { channel } from "@/db/schema";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { requireBusinessMember } from "@/lib/auth-utils";

export async function createWebFormChannel(data: { name: string; requireEmail?: boolean }) {
  const { businessId } = await requireBusinessMember("admin");

  const newId = `ch_${crypto.randomUUID()}`;
  await db.insert(channel).values({
    id: newId,
    businessId,
    type: "webform",
    name: data.name,
    config: {
      requireEmail: !!data.requireEmail,
      endpoint: `/api/forms/${newId}/submit`
    }
  });

  revalidatePath("/dashboard/settings/channels");
  return { id: newId };
}