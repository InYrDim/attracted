"use server";
import { db } from "@/db/drizzle";
import { channel } from "@/db/schema";
import crypto from "crypto";
import { eq, and } from "drizzle-orm";
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

export async function createWhatsAppChannel(data: { name: string; phoneNumberId: string; accessToken: string; verifyToken: string }) {
  const { businessId } = await requireBusinessMember("admin");

  const newId = `ch_${crypto.randomUUID()}`;
  await db.insert(channel).values({
    id: newId,
    businessId,
    type: "whatsapp",
    name: data.name,
    config: {
      phoneNumberId: data.phoneNumberId,
      accessToken: data.accessToken,
      verifyToken: data.verifyToken,
      webhookUrl: `/api/webhooks/whatsapp/${newId}`
    }
  });

  revalidatePath("/dashboard/settings/channels");
  return { id: newId };
}

export async function createInstagramChannel(data: { name: string; igAccountId: string; accessToken: string; verifyToken: string }) {
  const { businessId } = await requireBusinessMember("admin");

  const newId = `ch_${crypto.randomUUID()}`;
  await db.insert(channel).values({
    id: newId,
    businessId,
    type: "instagram",
    name: data.name,
    config: {
      igAccountId: data.igAccountId,
      accessToken: data.accessToken,
      verifyToken: data.verifyToken,
      webhookUrl: `/api/webhooks/instagram/${newId}`
    }
  });

  revalidatePath("/dashboard/settings/channels");
  return { id: newId };
}

export async function deleteChannel(channelId: string) {
  const { businessId } = await requireBusinessMember("admin");

  await db.delete(channel).where(and(eq(channel.id, channelId), eq(channel.businessId, businessId)));

  revalidatePath("/dashboard/settings/channels");
}