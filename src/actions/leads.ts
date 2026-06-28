"use server";
import { db } from "@/db/drizzle";
import { lead, businessMember, channel, conversation } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Lead, LeadWithRelations, Message } from "@/types";
import { sendMetaEvent } from "@/lib/meta-capi";

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

export async function ensureDefaultChannel(businessId: string) {
  const defaultChannel = await db.query.channel.findFirst({
    where: and(
      eq(channel.businessId, businessId),
      eq(channel.name, "Manual Entry"),
    ),
  });
  if (defaultChannel) return defaultChannel.id;

  const newId = `ch_${crypto.randomUUID()}`;
  await db.insert(channel).values({
    id: newId,
    businessId,
    type: "webform",
    name: "Manual Entry",
  });
  return newId;
}

export async function getLeads(): Promise<LeadWithRelations[]> {
  const businessId = await getBusinessId();
  return db.query.lead.findMany({
    where: eq(lead.businessId, businessId),
    with: {
      channel: true,
      assignedAgent: {
        with: { user: true },
      },
    },
    orderBy: (leads, { desc }) => [desc(leads.createdAt)],
  });
}

export async function createLead(data: {
  name: string;
  phone: string;
  email?: string;
}) {
  const businessId = await getBusinessId();
  const channelId = await ensureDefaultChannel(businessId);

  const newId = `ld_${crypto.randomUUID()}`;
  await db.insert(lead).values({
    id: newId,
    businessId,
    name: data.name,
    phone: data.phone,
    email: data.email,
    channelId: channelId,
    status: "new_lead",
  });

  // Send Conversion Event
  await sendMetaEvent(businessId, "Lead", {
    id: newId,
    email: data.email,
    phone: data.phone,
  });

  revalidatePath("/dashboard/leads");
}

export async function updateLeadStatus(id: string, status: Lead["status"]) {
  const businessId = await getBusinessId();
  await db
    .update(lead)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(lead.id, id), eq(lead.businessId, businessId)));
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${id}`);
}

export async function getLeadById(
  id: string,
): Promise<LeadWithRelations | undefined> {
  const businessId = await getBusinessId();
  return db.query.lead.findFirst({
    where: and(eq(lead.id, id), eq(lead.businessId, businessId)),
    with: {
      channel: true,
      assignedAgent: {
        with: { user: true },
      },
      orders: true,
    },
  });
}

export async function getLeadMessages(leadId: string): Promise<Message[]> {
  const businessId = await getBusinessId();

  // First, find the conversation for this lead
  const conv = await db.query.conversation.findFirst({
    where: and(
      eq(conversation.leadId, leadId),
      eq(conversation.businessId, businessId),
    ),
    with: {
      messages: {
        orderBy: (messages, { asc }) => [asc(messages.createdAt)],
      },
    },
  });

  return conv?.messages || [];
}
