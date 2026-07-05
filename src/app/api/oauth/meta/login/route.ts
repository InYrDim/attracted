import { NextResponse } from "next/server";
import { requireBusinessMember } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    const { businessId } = await requireBusinessMember("admin");
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get("redirect") || "/dashboard/settings/channels";
    const type = searchParams.get("type") || "instagram"; // instagram or whatsapp

    const clientId = process.env.META_APP_ID;
    if (!clientId) {
      return NextResponse.json({ error: "Meta App ID not configured" }, { status: 500 });
    }

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const callbackUrl = `${protocol}://${host}/api/oauth/meta/callback`;
    
    // Pass businessId, type, and redirect path in the state
    const state = Buffer.from(JSON.stringify({ businessId, type, redirectUrl })).toString("base64");

    let scopes = "";
    if (type === "whatsapp") {
      scopes = "whatsapp_business_messaging,whatsapp_business_management";
    } else if (type === "instagram") {
      scopes = "pages_show_list,pages_manage_metadata,instagram_basic,instagram_manage_messages";
    } else if (type === "ads") {
      scopes = "ads_read,ads_management";
    } else {
      scopes = "public_profile";
    }

    const metaAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}&scope=${scopes}&response_type=code`;

    return NextResponse.redirect(metaAuthUrl);
  } catch (error: any) {
    console.error("Meta OAuth Initiate Error:", error);
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
