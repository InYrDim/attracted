import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { channel, lead, clickLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { sendMetaEvent } from "@/lib/meta-capi";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const resolvedParams = await params;
    const formId = resolvedParams.formId;
    const body = await req.json();

    // 1. Validate Form Channel
    const ch = await db.query.channel.findFirst({
      where: eq(channel.id, formId),
    });

    if (!ch || ch.type !== "webform") {
      return new NextResponse("Form not found or invalid", { status: 404 });
    }

    const { name, phone, email, _trap } = body;
    
    // Honeypot spam protection
    if (_trap) {
      return new NextResponse("Spam detected", { status: 403 });
    }

    if (!name || !phone) {
      return new NextResponse("Name and phone are required", { status: 400 });
    }

    // 2. Attribution match via IP
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
      channelId: formId,
      name,
      phone,
      email,
      status: "new_lead",
      clickId: recentClick?.clickId,
      utmSource: recentClick?.utmSource,
      utmMedium: recentClick?.utmMedium,
      utmCampaign: recentClick?.utmCampaign,
    }).returning();

    if (recentClick && !recentClick.matchedLeadId) {
      await db.update(clickLog)
        .set({ matchedLeadId: newId })
        .where(eq(clickLog.id, recentClick.id));
    }

    // 3. Send CAPI Event
    await sendMetaEvent(ch.businessId, "Lead", {
      id: newId,
      email,
      phone,
      clickId: recentClick?.clickId,
    });

    return NextResponse.json({ success: true, leadId: newId });
  } catch (err: any) {
    console.error("Web Form Submit Error:", err);
    return new NextResponse(err.message || "Internal Server Error", { status: 500 });
  }
}
