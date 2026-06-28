import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { channel, lead, conversation, message as messageSchema, clickLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { sendMetaEvent } from "@/lib/meta-capi";

// GET: Meta Webhook Verification
export async function GET(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const resolvedParams = await params;
  const channelId = resolvedParams.channelId;
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (!mode || !token) {
    return new NextResponse("Missing params", { status: 400 });
  }

  // Fetch the channel to verify the token
  const ch = await db.query.channel.findFirst({
    where: eq(channel.id, channelId),
  });

  if (!ch || ch.type !== "whatsapp") {
    return new NextResponse("Channel not found", { status: 404 });
  }

  const config = ch.config as { verifyToken?: string } | null;
  
  if (mode === "subscribe" && token === config?.verifyToken) {
    console.log("WEBHOOK_VERIFIED");
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

// POST: Receive Messages
export async function POST(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const resolvedParams = await params;
    const channelId = resolvedParams.channelId;
    const body = await req.json();

    // Fetch channel config
    const ch = await db.query.channel.findFirst({
      where: eq(channel.id, channelId),
    });

    if (!ch) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            const messages = change.value.messages;
            const contacts = change.value.contacts;

            for (let i = 0; i < messages.length; i++) {
              const msg = messages[i];
              const contact = contacts?.[i];
              const phone = msg.from; // User's WhatsApp number
              const name = contact?.profile?.name || phone;
              const text = msg.type === "text" ? msg.text.body : `[${msg.type} message]`;

              // 1. Find or create lead
              let existingLead = await db.query.lead.findFirst({
                where: and(
                  eq(lead.businessId, ch.businessId),
                  eq(lead.phone, phone),
                  eq(lead.channelId, channelId)
                ),
              });

              if (!existingLead) {
                // Attribution match via IP
                const ip = req.headers.get("x-forwarded-for") || req.headers.get("remote-addr") || "unknown";
                const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
                
                const recentClick = await db.query.clickLog.findFirst({
                  where: and(
                    eq(clickLog.businessId, ch.businessId),
                    eq(clickLog.ipHash, ipHash)
                  ),
                  orderBy: (clickLogs, { desc }) => [desc(clickLogs.createdAt)]
                });

                const newId = `ld_${crypto.randomUUID()}`;
                const [newLead] = await db.insert(lead).values({
                  id: newId,
                  businessId: ch.businessId,
                  channelId: channelId,
                  name: name,
                  phone: phone,
                  status: "new_lead",
                  clickId: recentClick?.clickId,
                  utmSource: recentClick?.utmSource,
                  utmMedium: recentClick?.utmMedium,
                  utmCampaign: recentClick?.utmCampaign,
                }).returning();
                existingLead = newLead;

                if (recentClick && !recentClick.matchedLeadId) {
                  await db.update(clickLog)
                    .set({ matchedLeadId: newId })
                    .where(eq(clickLog.id, recentClick.id));
                }

                // Send CAPI Event
                await sendMetaEvent(ch.businessId, "Lead", {
                  id: newId,
                  phone: phone,
                  clickId: recentClick?.clickId,
                });
              }

              // 2. Find or create conversation
              let conv = await db.query.conversation.findFirst({
                where: and(
                  eq(conversation.businessId, ch.businessId),
                  eq(conversation.leadId, existingLead.id),
                  eq(conversation.channelId, channelId)
                ),
              });

              if (!conv) {
                const [newConv] = await db.insert(conversation).values({
                  id: `conv_${crypto.randomUUID()}`,
                  businessId: ch.businessId,
                  leadId: existingLead.id,
                  channelId: channelId,
                  lastMessageAt: new Date(),
                }).returning();
                conv = newConv;
              } else {
                await db.update(conversation)
                  .set({ lastMessageAt: new Date() })
                  .where(eq(conversation.id, conv.id));
              }

              // 3. Insert Message
              await db.insert(messageSchema).values({
                id: `msg_${msg.id || crypto.randomUUID()}`, // use WA message ID for idempotency if possible
                conversationId: conv.id,
                senderType: "lead",
                content: text,
              });
            }
          }
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("Not a WhatsApp event", { status: 404 });
    }
  } catch (err: any) {
    console.error("WhatsApp Webhook Error:", err);
    return new NextResponse(err.stack || err.message || "Internal Server Error", { status: 500 });
  }
}
