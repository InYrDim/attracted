"use server";
import { db } from "@/db/drizzle";
import { business } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireBusinessMember } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function updateBusinessOnboardingStep(
  step: number,
  data?: Record<string, unknown>,
) {
  const { businessId } = await requireBusinessMember("owner");
  const existing = await db.query.business.findFirst({
    where: eq(business.id, businessId),
    columns: { onboardingData: true },
  });
  const merged = { ...(existing?.onboardingData as Record<string, unknown> ?? {}), ...data, currentStep: step };
  await db
    .update(business)
    .set({ onboardingData: merged })
    .where(eq(business.id, businessId));
  revalidatePath("/onboarding");
}

export async function completeOnboarding() {
  const { businessId, userId } = await requireBusinessMember("owner");
  
  const b = await db.query.business.findFirst({
    where: eq(business.id, businessId),
  });

  if (!b) return;

  const data = (b.onboardingData as Record<string, any>) || {};

  // Update business details
  if (data.businessName || data.businessSlug) {
    await db
      .update(business)
      .set({
        name: data.businessName || b.name,
        slug: data.businessSlug || b.slug,
      })
      .where(eq(business.id, businessId));
  }

  // Create Product
  if (data.productName && data.productPrice) {
    const { product } = await import("@/db/schema");
    const crypto = await import("crypto");
    await db.insert(product).values({
      id: `prod_${crypto.randomUUID()}`,
      businessId,
      name: data.productName,
      basePrice: data.productPrice,
    });
  }

  // Create Channel
  if (data.channelName && data.channelType) {
    const { channel } = await import("@/db/schema");
    const crypto = await import("crypto");
    await db.insert(channel).values({
      id: `chan_${crypto.randomUUID()}`,
      businessId,
      name: data.channelName,
      type: data.channelType as any,
    });
  }

  // Invite Team Member
  if (data.invitedEmail) {
    const { businessMember } = await import("@/db/schema");
    const crypto = await import("crypto");
    await db.insert(businessMember).values({
      id: `mem_${crypto.randomUUID()}`,
      businessId,
      role: "agent",
      invitedEmail: data.invitedEmail,
    });
  }

  // Connect Ad Account
  if (data.adPlatform && data.adAccountId) {
    const { adAccount } = await import("@/db/schema");
    const crypto = await import("crypto");
    await db.insert(adAccount).values({
      id: `ad_${crypto.randomUUID()}`,
      businessId,
      platform: data.adPlatform as any,
      accountId: data.adAccountId,
    });
  }

  // Mark as completed and clear data
  await db
    .update(business)
    .set({ onboardingCompleted: true, onboardingData: {} })
    .where(eq(business.id, businessId));
    
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}

export async function getOnboardingStatus(): Promise<{
  completed: boolean;
  currentStep: number;
  data: Record<string, unknown>;
}> {
  const { businessId } = await requireBusinessMember("owner");
  const b = await db.query.business.findFirst({
    where: eq(business.id, businessId),
    columns: { onboardingCompleted: true, onboardingData: true },
  });
  const d = (b?.onboardingData ?? {}) as Record<string, unknown>;
  return {
    completed: b?.onboardingCompleted ?? false,
    currentStep: (d.currentStep as number) ?? 1,
    data: d,
  };
}
