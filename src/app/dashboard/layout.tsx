import { AppShell } from "@/components/app/shell";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { business, businessMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

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

  if (!member || !member.business || !member.business.onboardingCompleted) {
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
