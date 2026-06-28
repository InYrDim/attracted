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

  if (!ch || ch.type !== "instagram") {
    return new NextResponse("Channel not found", { status: 404 });
  }

  const config = ch.config as { verifyToken?: string } | null;
  
  if (mode === "subscribe" && token === config?.verifyToken) {
    console.log("INSTAGRAM_WEBHOOK_VERIFIED");
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

    const config = ch.config as { accessToken?: string } | null;
    const accessToken = config?.accessToken;

    if (body.object === "instagram") {
      for (const entry of body.entry) {
        if (entry.messaging) {
          for (const msgEvent of entry.messaging) {
            if (msgEvent.message) {
              const senderId = msgEvent.sender?.id;
              const msg = msgEvent.message;
              
              if (!senderId) continue;

              const text = msg.text || (msg.attachments ? `[Attachment]` : `[Unsupported message]`);
              const attachments = msg.attachments || null;

              // 1. Fetch Instagram User Profile
              let name = `IG_${senderId}`;
              if (accessToken) {
                try {
                  const profileRes = await fetch(
                    `https://graph.facebook.com/v19.0/${senderId}?fields=name,profile_pic&access_token=${accessToken}`
                  );
                  if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    name = profileData.name || name;
                  }
                } catch (profileErr) {
                  console.error("Failed to fetch IG user profile:", profileErr);
                }
              }

              // 2. Find or create lead
              let existingLead = await db.query.lead.findFirst({
                where: and(
                  eq(lead.businessId, ch.businessId),
                  eq(lead.phone, senderId), // store Instagram PSID in phone field
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
                  phone: senderId, // stores the Instagram User ID (PSID)
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
                  phone: senderId,
                  clickId: recentClick?.clickId,
                });
              }

              // 3. Find or create conversation
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

              // 4. Insert Message
              await db.insert(messageSchema).values({
                id: `msg_${msg.mid || crypto.randomUUID()}`,
                conversationId: conv.id,
                senderType: "lead",
                content: text,
                attachments: attachments,
              });
            }
          }
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("Not an Instagram event", { status: 404 });
    }
  } catch (err: any) {
    console.error("Instagram Webhook Error:", err);
    return new NextResponse(err.stack || err.message || "Internal Server Error", { status: 500 });
  }
}
