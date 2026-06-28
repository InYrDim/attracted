import crypto from "crypto";
import { db } from "@/db/drizzle";
import { adAccount } from "@/db/schema";
import { eq, and } from "drizzle-orm";

function hashData(data: string | null | undefined) {
  if (!data) return undefined;
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
}

export async function sendTikTokEvent(
  businessId: string,
  eventName: "SubmitForm" | "CompletePayment",
  leadData: {
    id: string;
    email?: string | null;
    phone?: string | null;
    clickId?: string | null;
    ipHash?: string | null;
  },
  value?: number
) {
  const account = await db.query.adAccount.findFirst({
    where: and(
      eq(adAccount.businessId, businessId),
      eq(adAccount.platform, "tiktok"),
      eq(adAccount.isActive, true)
    )
  });

  if (!account || !account.accessToken || !account.accountId) return;

  const pixelId = account.accountId;
  const eventId = eventName === "SubmitForm" ? `lead_${leadData.id}` : `purchase_${leadData.id}_${Date.now()}`;

  const userData: Record<string, any> = {};

  if (leadData.email) userData.email = hashData(leadData.email);
  if (leadData.phone) userData.phone_number = hashData(leadData.phone);
  if (leadData.clickId) userData.ttclid = leadData.clickId;
  if (leadData.ipHash) userData.external_id = hashData(leadData.id); 

  const payload: any = {
    pixel_code: pixelId,
    data: [
      {
        event: eventName,
        event_id: eventId,
        event_time: Math.floor(Date.now() / 1000),
        user: userData,
        page: {
          url: "https://attractcrm.com", 
        }
      }
    ]
  };

  if (eventName === "CompletePayment" && value !== undefined) {
    payload.data[0].properties = {
      currency: "IDR",
      value: value,
    };
  }

  const url = `https://business-api.tiktok.com/open_api/v1.3/pixel/track/`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Access-Token": account.accessToken,
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("TikTok CAPI Error:", err);
    } else {
      console.log(`TikTok CAPI: Sent ${eventName} for Lead ${leadData.id}`);
    }
  } catch (error) {
    console.error("TikTok CAPI Fetch Error:", error);
  }
}
