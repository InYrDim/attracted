import { Metadata } from "next";
import { db } from "@/db/drizzle";
import { requireBusinessMember } from "@/lib/auth-utils";
import OverviewClient from "./overview-client";

export const metadata: Metadata = {
  title: "Overview — Attract",
  description: "Business performance at a glance",
};

export default async function DashboardOverviewPage() {
  const { businessId } = await requireBusinessMember("agent");

  // Fetch real data
  const leads = await db.query.lead.findMany({
    where: (l, { eq }) => eq(l.businessId, businessId),
    with: { channel: true },
    orderBy: (l, { desc }) => [desc(l.createdAt)],
  });

  const orders = await db.query.order.findMany({
    where: (o, { eq }) => eq(o.businessId, businessId),
  });

  return <OverviewClient initialLeads={leads} initialOrders={orders} />;
}