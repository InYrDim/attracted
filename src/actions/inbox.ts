"use server";
import { db } from "@/db/drizzle";
import { conversation, message, businessMember } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getBusinessId() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) throw new Error("Unauthorized");
  
  const member = await db.query.businessMember.findFirst({
    where: eq(businessMember.userId, session.user.id),
  });
  
  if (!member) throw new Error("No business found");
  return member.businessId;
}

export async function getConversations() {
  const businessId = await getBusinessId();
  
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
  const businessId = await getBusinessId();
  
  // Verify conversation belongs to business
  const conv = await db.query.conversation.findFirst({
    where: and(eq(conversation.id, conversationId), eq(conversation.businessId, businessId))
  });
  
  if (!conv) throw new Error("Conversation not found");

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
