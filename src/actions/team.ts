"use server";
import { db } from "@/db/drizzle";
import { businessMember } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireBusinessMember } from "@/lib/auth-utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { user } from "@/db/auth-schema";
import crypto from "crypto";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "agent";
  status: "active" | "pending";
  joinedAt: Date | null;
};

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { businessId } = await requireBusinessMember("agent");

  const members = await db.query.businessMember.findMany({
    where: eq(businessMember.businessId, businessId),
    with: {
      user: true,
    },
  });

  return members.map((m) => ({
    id: m.id,
    name: m.user?.name || m.invitedEmail?.split("@")[0] || "Unknown",
    email: m.user?.email || m.invitedEmail || "unknown",
    role: m.role as "owner" | "admin" | "agent",
    status: m.acceptedAt ? "active" : "pending",
    joinedAt: m.acceptedAt,
  }));
}

export async function inviteMember(email: string, role: "admin" | "agent") {
  const { businessId } = await requireBusinessMember("admin");

  // Check if already a member (active or pending)
  const existing = await db.query.businessMember.findFirst({
    where: and(
      eq(businessMember.businessId, businessId),
      eq(businessMember.invitedEmail, email),
    ),
  });
  if (existing) throw new Error("User already invited");

  // Check if the user already has an account
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  const memberId = `mem_${crypto.randomUUID()}`;

  await db.insert(businessMember).values({
    id: memberId,
    businessId,
    userId: existingUser?.id || null,
    role,
    invitedEmail: email,
    invitedAt: new Date(),
    acceptedAt: existingUser ? new Date() : null, // auto-accept if user already exists
  });

  // TODO: send invitation email via better-auth or Resend/SendGrid

  revalidatePath("/dashboard/settings/team");
  return { ok: true, memberId };
}

export async function removeMember(memberId: string) {
  const { businessId, role } = await requireBusinessMember("admin");
  if (role !== "owner") throw new Error("Only the owner can remove members");

  // Prevent self-removal
  const { memberId: selfId } = await requireBusinessMember("owner");
  if (memberId === selfId) throw new Error("Owner cannot remove themselves");

  await db
    .delete(businessMember)
    .where(
      and(
        eq(businessMember.id, memberId),
        eq(businessMember.businessId, businessId),
      ),
    );

  revalidatePath("/dashboard/settings/team");
  return { ok: true };
}

export async function changeMemberRole(
  memberId: string,
  newRole: "admin" | "agent",
) {
  const { businessId } = await requireBusinessMember("owner");

  await db
    .update(businessMember)
    .set({ role: newRole })
    .where(
      and(
        eq(businessMember.id, memberId),
        eq(businessMember.businessId, businessId),
      ),
    );

  revalidatePath("/dashboard/settings/team");
  return { ok: true };
}

/**
 * Called by a user who clicks an invite link. Links the existing
 * business_member row (matched by email) to the current user.
 */
export async function acceptInvite() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) throw new Error("Unauthorized");

  const members = await db.query.businessMember.findMany({
    where: eq(businessMember.invitedEmail, session.user.email),
  });

  const pending = members.find((m) => !m.userId);
  if (!pending) throw new Error("No pending invite found");

  await db
    .update(businessMember)
    .set({
      userId: session.user.id,
      acceptedAt: new Date(),
    })
    .where(eq(businessMember.id, pending.id));

  revalidatePath("/dashboard/settings/team");
  return { ok: true, businessId: pending.businessId };
}
