import { db } from "@/db/drizzle";
import { channel } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ChannelsClient from "./channels-client";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ChannelsSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) redirect("/login");

  const member = await db.query.businessMember.findFirst({
    where: (bm, { eq }) => eq(bm.userId, session.user.id),
  });

  if (!member) {
    return <div>No business found</div>;
  }

  const channels = await db.query.channel.findMany({
    where: eq(channel.businessId, member.businessId),
    orderBy: (channels, { desc }) => [desc(channels.createdAt)]
  });

  return <ChannelsClient initialChannels={channels} />;
}
