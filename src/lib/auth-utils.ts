import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { businessMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

type MemberRole = "owner" | "admin" | "agent";

export async function requireBusinessRole(
  ...allowedRoles: MemberRole[]
): Promise<{ businessId: string; memberId: string; role: MemberRole }> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) throw new Error("Unauthorized");

  const member = await db.query.businessMember.findFirst({
    where: eq(businessMember.userId, session.user.id),
  });
  if (!member) throw new Error("No business found for user");

  if (allowedRoles.length > 0 && !allowedRoles.includes(member.role as MemberRole)) {
    throw new Error("Insufficient permissions");
  }

  return { businessId: member.businessId, memberId: member.id, role: member.role as MemberRole };
}

export async function requireBusinessMember(minRole: "owner" | "admin" | "agent"): ReturnType<typeof requireBusinessRole> {
  const roles: MemberRole[] = ["agent", "admin", "owner"];
  const idx = roles.indexOf(minRole);
  if (idx === -1) throw new Error(`Invalid minimum role: ${minRole}`);
  return requireBusinessRole(...roles.slice(idx));
}
