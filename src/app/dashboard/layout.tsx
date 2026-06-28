import { AppShell } from "@/components/app/shell";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { business, businessMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import crypto from "crypto";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session) {
    redirect("/login");
  }

  // Find the first business this user belongs to
  const member = await db.query.businessMember.findFirst({
    where: eq(businessMember.userId, session.user.id),
    with: {
      business: true,
    },
  });

  // Fallback: user signed up via better-auth but databaseHooks didn't run,
  // or they're accepting an invite. Create a business on the fly.
  if (!member || !member.business) {
    const bId = `bus_${crypto.randomUUID()}`;
    const mId = `mem_${crypto.randomUUID()}`;
    const now = new Date();
    const slug = `bus-${now.getTime()}`;
    await db.insert(business).values({
      id: bId,
      name: `${session.user.name}'s Business`,
      slug,
      ownerId: session.user.id,
    });

    await db.insert(businessMember).values({
      id: mId,
      businessId: bId,
      userId: session.user.id,
      role: "owner",
      acceptedAt: now,
    });

    return (
      <AppShell
        user={session.user}
        business={{
          id: bId,
          name: `${session.user.name}'s Business`,
          slug,
          ownerId: session.user.id,
          plan: "Starter",
          createdAt: now,
          onboardingCompleted: false,
        }}
      >
        {children}
      </AppShell>
    );
  }

  // Redirect to onboarding if not completed
  if (!member.business.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      user={session.user}
      business={member.business}
    >
      {children}
    </AppShell>
  );
}