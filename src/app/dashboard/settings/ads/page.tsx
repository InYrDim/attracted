import { db } from "@/db/drizzle";
import { adAccount } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import AdsClient from "./ads-client";

export default async function AdsSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const member = await db.query.businessMember.findFirst({
    where: (bm, { eq }) => eq(bm.userId, session.user.id),
  });
  if (!member) return <div>No business found</div>;

  const accounts = await db.query.adAccount.findMany({
    where: eq(adAccount.businessId, member.businessId),
    with: { campaigns: true },
    orderBy: (a, { desc }) => [desc(a.createdAt)],
  });

  return (
    <AdsClient
      initialAccounts={accounts.map((a) => ({
        id: a.id,
        platform: a.platform as "meta" | "tiktok" | "google",
        accountId: a.accountId,
        isActive: a.isActive,
        createdAt: a.createdAt.toISOString(),
        campaignCount: a.campaigns.length,
      }))}
    />
  );
}
