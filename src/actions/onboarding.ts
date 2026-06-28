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
  const { businessId } = await requireBusinessMember("owner");
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
