"use server";
import { db } from "@/db/drizzle";
import { channel } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

async function getBusinessId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");

  const member = await db.query.businessMember.findFirst({
    where: (bm, { eq }) => eq(bm.userId, session.user.id),
  });
  if (!member) throw new Error("No business found");

  return member.businessId;
}

export async function createWebFormChannel(data: { name: string; requireEmail?: boolean }) {
  const businessId = await getBusinessId();
  
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
