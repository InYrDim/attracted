"use server";
import { db } from "@/db/drizzle";
import { order, businessMember, lead } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { OrderWithRelations, Order } from "@/types";
import { sendMetaEvent } from "@/lib/meta-capi";
import { sendTikTokEvent } from "@/lib/tiktok-capi";
import { sendGoogleEvent } from "@/lib/google-capi";
import { requireBusinessMember } from "@/lib/auth-utils";
import crypto from "crypto";
import { generateTrackingNumber } from "@/lib/shipping";

export async function getOrders(): Promise<OrderWithRelations[]> {
  const { businessId } = await requireBusinessMember("agent");
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
  const { businessId } = await requireBusinessMember("agent");

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

  const orderId = `ord_${crypto.randomUUID()}`;
  let trackingNumber = data.trackingNumber;

  if (data.shippingCourier && (!trackingNumber || trackingNumber === "")) {
    trackingNumber = await generateTrackingNumber(data.shippingCourier, orderId);
  }

  await db.insert(order).values({
    id: orderId,
    businessId,
    leadId: data.leadId,
    agentId,
    items: data.items,
    totalPrice: data.totalPrice,
    shippingAddress: data.shippingAddress,
    shippingCourier: data.shippingCourier,
    trackingNumber: trackingNumber,
    status: "pending",
  });

  // also update the lead status to "order"
  await db.update(lead)
    .set({ status: "order", updatedAt: new Date() })
    .where(and(eq(lead.id, data.leadId), eq(lead.businessId, businessId)));

  // send Meta CAPI Purchase event
  const l = await db.query.lead.findFirst({
    where: and(eq(lead.id, data.leadId), eq(lead.businessId, businessId))
  });

  if (l) {
    await sendMetaEvent(
      businessId, 
      "Purchase", 
      { id: l.id, email: l.email, phone: l.phone, clickId: l.clickId },
      data.totalPrice
    );
    await sendTikTokEvent(
      businessId, 
      "CompletePayment", 
      { id: l.id, email: l.email, phone: l.phone, clickId: l.clickId },
      data.totalPrice
    );
    await sendGoogleEvent(
      businessId, 
      "Purchase", 
      { id: l.id, email: l.email, phone: l.phone, clickId: l.clickId },
      data.totalPrice
    );
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/leads");
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const { businessId } = await requireBusinessMember("agent");
  await db.update(order)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(order.id, id), eq(order.businessId, businessId)));
  revalidatePath("/dashboard/orders");
}