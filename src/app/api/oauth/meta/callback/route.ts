import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { channel } from "@/db/schema";
import crypto from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("Meta OAuth Callback Error:", searchParams.get("error_description"));
    return NextResponse.redirect(new URL("/dashboard/settings/channels?error=oauth_rejected", request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard/settings/channels?error=invalid_request", request.url));
  }

  try {
    const parsedState = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
    const { businessId, type, redirectUrl } = parsedState;

    if (!businessId) {
      throw new Error("No business ID in state");
    }

    const clientId = process.env.META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;
    
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const callbackUrl = `${protocol}://${host}/api/oauth/meta/callback`;

    // 1. Exchange code for short-lived access token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&client_secret=${clientSecret}&code=${code}`;
    
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange short-lived token for long-lived access token
    const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;
    
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    
    if (longLivedData.error) {
      throw new Error(longLivedData.error.message);
    }

    const accessToken = longLivedData.access_token;

    // 3. Auto-discover IG Account ID if possible
    let igAccountId = "";
    
    if (type === "instagram") {
      const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`);
      const pagesData = await pagesRes.json();
      
      if (pagesData.data && pagesData.data.length > 0) {
        // Just take the first connected page for simplicity in this MVP
        const pageId = pagesData.data[0].id;
        const pageToken = pagesData.data[0].access_token;
        
        const igRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`);
        const igData = await igRes.json();
        
        if (igData.instagram_business_account) {
          igAccountId = igData.instagram_business_account.id;
        }
      }
    }

    // 4. Save to Database
    const newId = `ch_${crypto.randomUUID()}`;
    await db.insert(channel).values({
      id: newId,
      businessId,
      type: type === "whatsapp" ? "whatsapp" : "instagram",
      name: `Meta Connected (${type})`,
      config: {
        accessToken: accessToken,
        verifyToken: crypto.randomUUID(), // Automatically generate a webhook verify token
        webhookUrl: `${protocol}://${host}/api/webhooks/${type}/${newId}`,
        ...(type === "instagram" ? { igAccountId: igAccountId } : { phoneNumberId: "" })
      }
    });

    // 5. Redirect back to UI with success
    const finalUrl = new URL(redirectUrl || "/dashboard/settings/channels", request.url);
    finalUrl.searchParams.set("success", "oauth_connected");
    
    return NextResponse.redirect(finalUrl);
  } catch (err: any) {
    console.error("Meta OAuth Processing Error:", err);
    return NextResponse.redirect(new URL("/dashboard/settings/channels?error=processing_failed", request.url));
  }
}
