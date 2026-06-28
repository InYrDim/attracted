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
  accessToken: string,
) {
  const { businessId } = await requireBusinessMember("admin");

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
