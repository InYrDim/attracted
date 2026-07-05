import { Metadata } from "next";
import ReportsClient from "./reports-client";
import { db } from "@/db/drizzle";
import { requireBusinessMember } from "@/lib/auth-utils";

export const metadata: Metadata = {
  title: "Reports — Attract",
  description: "Ad, Sales, and CS Performance Reports",
};

export default async function ReportsPage() {
  const { businessId } = await requireBusinessMember("agent");

  // In a real app, we would calculate this server-side using SQL aggregations.
  // We're querying all data and aggregating it in the client for the prototype.
  const leads = await db.query.lead.findMany({
    where: (l, { eq }) => eq(l.businessId, businessId),
    with: {
      channel: true,
      orders: true,
      assignedAgent: { with: { user: true } },
    }
  });

  const orders = await db.query.order.findMany({
    where: (o, { eq }) => eq(o.businessId, businessId),
  });
  
  const dbCampaigns = await db.query.adCampaign.findMany({
    where: (c, { eq }) => eq(c.businessId, businessId),
  });

  return <ReportsClient leads={leads} orders={orders} dbCampaigns={dbCampaigns} />;
}