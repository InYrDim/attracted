"use server";

import { db } from "@/db/drizzle";
import { automationRule } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireBusinessMember } from "@/lib/auth-utils";
import crypto from "crypto";

export async function getAutomationRules() {
  const { businessId } = await requireBusinessMember("agent");

  const rules = await db.query.automationRule.findMany({
    where: eq(automationRule.businessId, businessId),
    orderBy: (rules, { desc }) => [desc(rules.createdAt)],
  });

  return rules;
}

export type CreateRuleInput = {
  name?: string;
  trigger: string;
  conditions?: Record<string, unknown>;
  actionType: "send_message" | "assign_agent" | "notify" | "change_status";
  actionConfig?: Record<string, unknown>;
  isActive?: boolean;
};

export async function createAutomationRule(data: CreateRuleInput) {
  const { businessId } = await requireBusinessMember("admin");

  const id = `ar_${crypto.randomUUID()}`;

  await db.insert(automationRule).values({
    id,
    businessId,
    trigger: data.trigger,
    name: data.name || null,
    conditions: data.conditions ?? null,
    actionType: data.actionType,
    actionConfig: data.actionConfig ?? null,
    isActive: data.isActive ?? true,
  });

  revalidatePath("/dashboard/settings/automation");
  return { ok: true, id };
}

export async function toggleAutomationRule(ruleId: string, isActive: boolean) {
  const { businessId } = await requireBusinessMember("admin");

  await db
    .update(automationRule)
    .set({ isActive })
    .where(
      and(
        eq(automationRule.id, ruleId),
        eq(automationRule.businessId, businessId),
      ),
    );

  revalidatePath("/dashboard/settings/automation");
  return { ok: true };
}

export async function deleteAutomationRule(ruleId: string) {
  const { businessId } = await requireBusinessMember("admin");

  await db
    .delete(automationRule)
    .where(
      and(
        eq(automationRule.id, ruleId),
        eq(automationRule.businessId, businessId),
      ),
    );

  revalidatePath("/dashboard/settings/automation");
  return { ok: true };
}
