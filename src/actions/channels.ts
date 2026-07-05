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

export async function createTikTokChannel(data: { name: string; ttAccountId: string; accessToken: string; verifyToken: string }) {
  const { businessId } = await requireBusinessMember("admin");

  const newId = `ch_${crypto.randomUUID()}`;
  await db.insert(channel).values({
    id: newId,
    businessId,
    type: "tiktok",
    name: data.name,
    config: {
      ttAccountId: data.ttAccountId,
      accessToken: data.accessToken,
      verifyToken: data.verifyToken,
      webhookUrl: `/api/webhooks/tiktok/${newId}`
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

export async function verifyMetaConnection(channelId: string) {
  const { businessId } = await requireBusinessMember("admin");
  
  const ch = await db.query.channel.findFirst({
    where: and(eq(channel.id, channelId), eq(channel.businessId, businessId))
  });
  
  if (!ch) throw new Error("Channel not found");
  
  const config = ch.config as any;
  if (!config?.accessToken) throw new Error("No access token found");
  
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${config.accessToken}&fields=name,id`);
    const data = await res.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return {
      success: true,
      name: data.name,
      id: data.id
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to connect to Meta"
    };
  }
}