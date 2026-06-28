import { updateBusinessOnboardingStep, completeOnboarding, getOnboardingStatus } from "@/actions/onboarding";
import { db } from "@/db/drizzle";
import { business, businessMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { OnboardingClient } from "./onboarding-client";

export default async function OnboardingPage() {
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

  if (!member || !member.business) {
    // Auto-create business if user signed up via better-auth but doesn't have one
    const businessId = `bus_${crypto.randomUUID()}`;
    const memberId = `mem_${crypto.randomUUID()}`;
    const now = new Date();
    const slug = `bus-${now.getTime()}`;
    
    // Create business record
    await db.insert(business).values({
      id: businessId,
      name: `${session.user.name}'s Business`,
      slug,
      ownerId: session.user.id,
      plan: "Starter",
      onboardingCompleted: false,
      onboardingData: {},
    });

    // Create business member record
    await db.insert(businessMember).values({
      id: memberId,
      businessId: businessId,
      userId: session.user.id,
      role: "owner",
      acceptedAt: now,
    });

    // Pre-populate step 1 with business details
    await updateBusinessOnboardingStep(1, {
      businessName: `${session.user.name}'s Business`,
      businessSlug: slug,
    });

    redirect("/onboarding");
  }

  const onboardingStatus = await getOnboardingStatus();

  if (onboardingStatus.completed) {
    redirect("/dashboard/inbox");
  }

  return <OnboardingClient initialStep={onboardingStatus.currentStep} initialData={onboardingStatus.data} />;
}