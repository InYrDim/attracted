import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { businessMember, business } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) {
    return NextResponse.json({ exists: false, onboardingCompleted: true }, { status: 401 });
  }

  const member = await db.query.businessMember.findFirst({
    where: eq(businessMember.userId, session.user.id),
    columns: { businessId: true },
  });
  if (!member) {
    return NextResponse.json({ exists: false, onboardingCompleted: false });
  }

  const b = await db.query.business.findFirst({
    where: eq(business.id, member.businessId),
    columns: { onboardingCompleted: true },
  });

  return NextResponse.json({ exists: true, onboardingCompleted: b?.onboardingCompleted ?? false });
}
