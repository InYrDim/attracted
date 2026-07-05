"use server";

import { db } from "@/db/drizzle";
import { adAccount } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireBusinessMember } from "@/lib/auth-utils";
import crypto from "crypto";

type GraphApiErrorResponse = {
  error?: {
    message?: string;
  };
};

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Failed to verify ad account credentials.";
}

function isLikelyMetaAppSecret(value: string): boolean {
  return /^[a-f0-9]{32}$/i.test(value.trim());
}

function createMetaAppSecretProof(accessToken: string): string | null {
  const appSecret = process.env.META_APP_SECRET?.trim();
  if (!appSecret) return null;

  return crypto.createHmac("sha256", appSecret).update(accessToken).digest("hex");
}

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
      if (isLikelyMetaAppSecret(accessToken)) {
        throw new Error("Meta App Secret was entered where an OAuth access token is required. Use a Marketing API access token for the ad account instead.");
      }

      // Graph API to check ad account: /v25.0/{act_id}?fields=name,account_status&access_token=...
      const actId = platformAccountId.startsWith("act_") ? platformAccountId : `act_${platformAccountId}`;
      const url = new URL(`https://graph.facebook.com/v25.0/${actId}`);
      url.searchParams.set("fields", "name,account_status");
      url.searchParams.set("access_token", accessToken);
      const appSecretProof = createMetaAppSecretProof(accessToken);
      if (appSecretProof) {
        url.searchParams.set("appsecret_proof", appSecretProof);
      }
      const res = await fetch(url);
      
      if (!res.ok) {
        const err = (await res.json()) as GraphApiErrorResponse;
        throw new Error(`Meta verification failed: ${err.error?.message || "Invalid token or account ID"}`);
      }
      
      const data = await res.json();
      // account_status: 1 = ACTIVE, 2 = DISABLED, etc.
      if (data.account_status === 2) {
        throw new Error("This Meta Ad Account is disabled.");
      }
    } else if (platform === "tiktok") {
      // TikTok Marketing API requires App ID/Secret setup for full validation.
      // Endpoint: https://business-api.tiktok.com/open_api/v1.3/advertiser/info/
      if (accessToken.length < 20) {
        throw new Error("Invalid TikTok access token format.");
      }
    } else if (platform === "google") {
      // Google Ads API requires a Developer Token in headers.
      // Endpoint: https://googleads.googleapis.com/v16/customers/{customer_id}
      if (accessToken.length < 20) {
        throw new Error("Invalid Google access token format.");
      }
    }
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err));
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
