"use server";

import { db } from "@/db/drizzle";
import { adAccount } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireBusinessMember } from "@/lib/auth-utils";
import crypto from "crypto";

export type AdAccountWithCampaignCount = {
  id: string;
  businessId: string;
  platform: "meta" | "tiktok" | "google";
  accountId: string;
  accessToken: string | null;
  isActive: boolean;
  createdAt: Date;
  campaignCount: number;
};

export async function getAdAccounts(): Promise<AdAccountWithCampaignCount[]> {
  const { businessId } = await requireBusinessMember("agent");

  const accounts = await db.query.adAccount.findMany({
    where: eq(adAccount.businessId, businessId),
    with: { campaigns: true },
    orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
  });

  return accounts.map((a) => ({
    id: a.id,
    businessId: a.businessId,
    platform: a.platform as "meta" | "tiktok" | "google",
    accountId: a.accountId,
    accessToken: a.accessToken,
    isActive: a.isActive,
    createdAt: a.createdAt,
    campaignCount: a.campaigns.length,
  }));
}

export async function addAdAccount(
  platform: "meta" | "tiktok" | "google",
  platformAccountId: string,
  accessToken: string
) {
  const { businessId } = await requireBusinessMember("admin");

  // Verify the credentials with the respective platform API
  try {
    if (platform === "meta") {
      // Graph API to check ad account: /v19.0/{act_id}?access_token=...
      const actId = platformAccountId.startsWith("act_") ? platformAccountId : `act_${platformAccountId}`;
      const res = await fetch(`https://graph.facebook.com/v19.0/${actId}?access_token=${accessToken}`);
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(`Meta verification failed: ${err.error?.message || "Invalid token or account ID"}`);
      }
    } else if (platform === "tiktok") {
      // Basic check for TikTok (since their Ads API requires full oauth/app setup, this is a placeholder)
      // In reality, TikTok requires an app ID and secret to hit their Ads API.
      // We will do a length check on the token for now, or you can implement the actual /open_api/v1.3/oauth2/advertiser/get/ call.
      if (accessToken.length < 20) {
        throw new Error("Invalid TikTok access token format.");
      }
    } else if (platform === "google") {
      // Google Ads API verification (requires developer token + OAuth token in practice)
      // This is a placeholder for the actual gRPC/REST call
      if (accessToken.length < 20) {
        throw new Error("Invalid Google access token format.");
      }
    }
  } catch (err: any) {
    throw new Error(err.message || "Failed to verify ad account credentials.");
  }

  const id = `ad_${crypto.randomUUID()}`;
  await db.insert(adAccount).values({
    id,
    businessId,
    platform,
    accountId: platformAccountId,
    accessToken,
    isActive: true,
  });

  revalidatePath("/dashboard/settings/ads");
  return { ok: true, id };
}

export async function removeAdAccount(accountId: string) {
  const { businessId } = await requireBusinessMember("admin");

  // FK cascade deletes campaigns automatically
  await db
    .delete(adAccount)
    .where(
      and(eq(adAccount.id, accountId), eq(adAccount.businessId, businessId)),
    );

  revalidatePath("/dashboard/settings/ads");
  return { ok: true };
}

export async function toggleAdAccountStatus(accountId: string, isActive: boolean) {
  const { businessId } = await requireBusinessMember("admin");

  await db
    .update(adAccount)
    .set({ isActive })
    .where(
      and(eq(adAccount.id, accountId), eq(adAccount.businessId, businessId)),
    );

  revalidatePath("/dashboard/settings/ads");
  return { ok: true };
}
