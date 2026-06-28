import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { clickLog } from "@/db/schema";
import crypto from "crypto";

export async function GET(req: Request) {
  return handleTrack(req);
}

export async function POST(req: Request) {
  return handleTrack(req);
}

async function handleTrack(req: Request) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Check if GET params exist, otherwise check POST body
    let businessId = searchParams.get("b");
    let clickId = searchParams.get("fbclid") || searchParams.get("ttclid") || searchParams.get("gclid");
    let utmSource = searchParams.get("utm_source");
    let utmMedium = searchParams.get("utm_medium");
    let utmCampaign = searchParams.get("utm_campaign");

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (!businessId) businessId = body.b || body.businessId;
        if (!clickId) clickId = body.clickId || body.fbclid || body.ttclid || body.gclid;
        if (!utmSource) utmSource = body.utm_source;
        if (!utmMedium) utmMedium = body.utm_medium;
        if (!utmCampaign) utmCampaign = body.utm_campaign;
      } catch (e) {
        // Ignore JSON parse errors for GET requests masquerading as POST without body
      }
    }

    if (!businessId) {
      return new NextResponse("Missing business ID", { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("remote-addr") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    await db.insert(clickLog).values({
      id: `clk_${crypto.randomUUID()}`,
      businessId,
      clickId,
      ipHash,
      userAgent: userAgent.substring(0, 255),
      utmSource,
      utmMedium,
      utmCampaign,
    });

    // Return a 1x1 transparent pixel for GET requests (standard tracking pixel behavior)
    if (req.method === "GET") {
      const pixel = Buffer.from("R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", "base64");
      return new NextResponse(pixel, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
