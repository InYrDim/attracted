import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { channel, lead, conversation, message as messageSchema, clickLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

// GET: TikTok Webhook Verification
export async function GET(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const resolvedParams = await params;
  const channelId = resolvedParams.channelId;
  const url = new URL(req.url);
  
  // TikTok uses hub.challenge verify pattern similar to Meta or a simple token check
  const mode = url.searchParams.get("hub.mode") || url.searchParams.get("mode");
  const token = url.searchParams.get("hub.verify_token") || url.searchParams.get("verify_token");
  const challenge = url.searchParams.get("hub.challenge") || url.searchParams.get("challenge");

  if (!token) {
    return new NextResponse("Missing params", { status: 400 });
  }

  // Fetch the channel to verify the token
  const ch = await db.query.channel.findFirst({
    where: eq(channel.id, channelId),
  });

  if (!ch || ch.type !== "tiktok") {
    return new NextResponse("Channel not found", { status: 404 });
  }

  const config = ch.config as { verifyToken?: string } | null;
  
  if (token === config?.verifyToken) {
    console.log("TIKTOK_WEBHOOK_VERIFIED");
    return new NextResponse(challenge || "verified", { status: 200 });
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

    // Handle TikTok webhook structure (extracting message / sender info)
    const messageEvent = body.message || body.data?.message || (body.event === "message" ? body : null);
    
    if (messageEvent) {
      const senderId = messageEvent.sender_id || messageEvent.sender?.id || messageEvent.from_user_id;
      const text = messageEvent.text || messageEvent.content || messageEvent.body || "[Media/Attachment]";
      const mid = messageEvent.message_id || messageEvent.id || crypto.randomUUID();

      if (senderId) {
        // 1. Fetch TikTok User Profile (Mock / Fallback)
        let name = `TikTok_${senderId}`;
        if (accessToken) {
          try {
            // Placeholder for TikTok API user profile request
            const profileRes = await fetch(
              `https://open.tiktokapis.com/v2/user/info/`,
              {
                headers: { Authorization: "Bearer " + accessToken }
              }
            );
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              name = profileData.data?.user?.display_name || name;
            }
          } catch (profileErr) {
            console.error("Failed to fetch TikTok user profile:", profileErr);
          }
        }

        // 2. Find or create lead
        let existingLead = await db.query.lead.findFirst({
          where: and(
            eq(lead.businessId, ch.businessId),
            eq(lead.phone, senderId), // store TikTok PSID/User ID in phone field
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
            phone: senderId,
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
          id: `msg_${mid}`,
          conversationId: conv.id,
          senderType: "lead",
          content: text,
        });

        return new NextResponse("EVENT_RECEIVED", { status: 200 });
      }
    }

    return new NextResponse("No processed message found", { status: 400 });
  } catch (err: any) {
    console.error("TikTok Webhook Error:", err);
    return new NextResponse(err.stack || err.message || "Internal Server Error", { status: 500 });
  }
}
