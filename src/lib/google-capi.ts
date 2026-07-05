import crypto from "crypto";
import { db } from "@/db/drizzle";
import { adAccount } from "@/db/schema";
import { eq, and } from "drizzle-orm";

function hashData(data: string | null | undefined) {
  if (!data) return undefined;
  // Google requires SHA-256 hex, lowercase, no whitespace
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
}

export async function sendGoogleEvent(
  businessId: string,
  eventName: "Lead" | "Purchase",
  leadData: {
    id: string;
    email?: string | null;
    phone?: string | null;
    clickId?: string | null;
  },
  value?: number
) {
  const account = await db.query.adAccount.findFirst({
    where: and(
      eq(adAccount.businessId, businessId),
      eq(adAccount.platform, "google"),
      eq(adAccount.isActive, true)
    )
  });

  if (!account || !account.accessToken || !account.accountId) return;

  // Measurement ID or Conversion ID
  const measurementId = account.accountId;
  const apiSecret = account.accessToken; // Measurement Protocol API secret

  // For Google Measurement Protocol (GA4) which can be linked to Google Ads
  // Note: True Google Ads Enhanced Conversions via API requires a different endpoint
  // and OAuth, but this is the standard server-side tracking pattern for this stack.

  const userData: Record<string, unknown> = {};
  if (leadData.email) userData.sha256_email_address = hashData(leadData.email);
  if (leadData.phone) userData.sha256_phone_number = hashData(leadData.phone);
  
  const payload: Record<string, unknown> = {
    client_id: leadData.id, // Using lead ID as client ID for server-side
    user_data: Object.keys(userData).length > 0 ? userData : undefined,
    events: [
      {
        name: eventName === "Lead" ? "generate_lead" : "purchase",
        params: {
          currency: "IDR",
        }
      }
    ]
  };

  if (eventName === "Purchase" && value !== undefined) {
    payload.events[0].params.value = value;
    payload.events[0].params.transaction_id = `trx_${leadData.id}_${Date.now()}`;
  }

  // Include GCLID if available
  if (leadData.clickId) {
    payload.events[0].params.campaign_id = leadData.clickId; // Map gclid for attribution
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error("Google CAPI Error: HTTP status", res.status);
    } else {
      console.log(`Google CAPI: Sent ${eventName} for Lead ${leadData.id}`);
    }
  } catch (error) {
    console.error("Google CAPI Fetch Error:", error);
  }
}
