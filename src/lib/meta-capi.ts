import crypto from "crypto";
import { db } from "@/db/drizzle";
import { adAccount } from "@/db/schema";
import { eq, and } from "drizzle-orm";

function hashData(data: string | null | undefined) {
  if (!data) return undefined;
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
}

export async function sendMetaEvent(
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
  // Get active Meta ad account
  const account = await db.query.adAccount.findFirst({
    where: and(
      eq(adAccount.businessId, businessId),
      eq(adAccount.platform, "meta"),
      eq(adAccount.isActive, true)
    )
  });

  if (!account || !account.accessToken || !account.accountId) return;

  const pixelId = account.accountId;

  const userData: Record<string, any> = {
    client_user_agent: "AttractCRM-System", // We can use actual UA if captured during webform submit
  };

  if (leadData.email) userData.em = hashData(leadData.email);
  if (leadData.phone) userData.ph = hashData(leadData.phone);
  if (leadData.clickId) userData.fbc = leadData.clickId; // the fbclid

  const eventId = eventName === "Lead" ? `lead_${leadData.id}` : `purchase_${leadData.id}_${Date.now()}`;

  const payload: any = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "system_generated",
        event_id: eventId,
        user_data: userData,
      }
    ]
  };

  if (eventName === "Purchase" && value !== undefined) {
    payload.data[0].custom_data = {
      currency: "IDR",
      value: value,
    };
  }

  const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${account.accessToken}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Meta CAPI Error:", err);
    } else {
      console.log(`Meta CAPI: Sent ${eventName} for Lead ${leadData.id}`);
    }
  } catch (error) {
    console.error("Meta CAPI Fetch Error:", error);
  }
}
