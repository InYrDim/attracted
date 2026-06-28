"use server";
import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { sendInstagramMessage } from "@/lib/instagram";
import { sendTikTokMessage } from "@/lib/tiktok";
import { requireBusinessMember } from "@/lib/auth-utils";
import crypto from "crypto";

export async function getConversations() {
  const { businessId } = await requireBusinessMember("agent");

  return db.query.conversation.findMany({
    where: eq(conversation.businessId, businessId),
    with: {
      lead: true,
      channel: true,
      messages: {
        orderBy: (messages, { asc }) => [asc(messages.createdAt)]
      }
    },
    orderBy: (conversations, { desc }) => [desc(conversations.lastMessageAt)]
  });
}

export async function sendInboxMessage(conversationId: string, content: string) {
  const { businessId } = await requireBusinessMember("agent");

  // Verify conversation belongs to business
  const conv = await db.query.conversation.findFirst({
    where: and(eq(conversation.id, conversationId), eq(conversation.businessId, businessId)),
    with: {
      channel: true,
      lead: true,
    }
  });

  if (!conv) throw new Error("Conversation not found");

  // Send external message if channel is WhatsApp
  if (conv.channel?.type === "whatsapp") {
    const config = conv.channel.config as any;
    if (config?.phoneNumberId && config?.accessToken && conv.lead?.phone) {
      try {
        await sendWhatsAppMessage({
          phoneNumberId: config.phoneNumberId,
          accessToken: config.accessToken,
          to: conv.lead.phone,
          text: content,
        });
      } catch (error) {
        console.error("Failed to send WA message:", error);
        throw new Error("Failed to send WhatsApp message");
      }
    }
  }

  // Send external message if channel is Instagram
  if (conv.channel?.type === "instagram") {
    const config = conv.channel.config as any;
    if (config?.igAccountId && config?.accessToken && conv.lead?.phone) {
      try {
        await sendInstagramMessage({
          igAccountId: config.igAccountId,
          accessToken: config.accessToken,
          to: conv.lead.phone,
          text: content,
        });
      } catch (error) {
        console.error("Failed to send IG message:", error);
        throw new Error("Failed to send Instagram message");
      }
    }
  }

  // Send external message if channel is TikTok
  if (conv.channel?.type === "tiktok") {
    const config = conv.channel.config as any;
    if (config?.ttAccountId && config?.accessToken && conv.lead?.phone) {
      try {
        await sendTikTokMessage({
          ttAccountId: config.ttAccountId,
          accessToken: config.accessToken,
          to: conv.lead.phone,
          text: content,
        });
      } catch (error) {
        console.error("Failed to send TikTok message:", error);
        throw new Error("Failed to send TikTok message");
      }
    }
  }

  await db.insert(message).values({
    id: `msg_${crypto.randomUUID()}`,
    conversationId,
    senderType: "agent",
    content
  });

  await db.update(conversation)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversation.id, conversationId));

  revalidatePath("/dashboard/inbox");
  revalidatePath(`/dashboard/leads/${conv.leadId}`);
}