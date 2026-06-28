"use server";
import { db } from "@/db/drizzle";
import { order, businessMember, lead } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { OrderWithRelations, Order } from "@/types";

async function getBusinessId() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) throw new Error("Unauthorized");
  
  const member = await db.query.businessMember.findFirst({
    where: eq(businessMember.userId, session.user.id),
  });
  
  if (!member) throw new Error("No business found");
  return member.businessId;
}

export async function getOrders(): Promise<OrderWithRelations[]> {
  const businessId = await getBusinessId();
  return db.query.order.findMany({
    where: eq(order.businessId, businessId),
    with: {
      lead: true,
      agent: {
        with: { user: true }
      }
    },
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
  });
}

export async function createOrder(data: {
  leadId: string;
  items: any;
  totalPrice: number;
  shippingAddress?: string;
  shippingCourier?: string;
  trackingNumber?: string;
}) {
  const businessId = await getBusinessId();
  
  // optionally get the current user as agent
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  let agentId = null;
  if (session) {
    const member = await db.query.businessMember.findFirst({
      where: and(eq(businessMember.userId, session.user.id), eq(businessMember.businessId, businessId)),
    });
    if (member) agentId = member.id;
  }

  await db.insert(order).values({
    id: `ord_${crypto.randomUUID()}`,
    businessId,
    leadId: data.leadId,
    agentId,
    items: data.items,
    totalPrice: data.totalPrice,
    shippingAddress: data.shippingAddress,
    shippingCourier: data.shippingCourier,
    trackingNumber: data.trackingNumber,
    status: "pending",
  });

  // also update the lead status to "order"
  await db.update(lead)
    .set({ status: "order", updatedAt: new Date() })
    .where(and(eq(lead.id, data.leadId), eq(lead.businessId, businessId)));

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/leads");
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const businessId = await getBusinessId();
  await db.update(order)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(order.id, id), eq(order.businessId, businessId)));
  revalidatePath("/dashboard/orders");
}
