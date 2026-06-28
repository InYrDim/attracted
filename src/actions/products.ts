"use server";
import { db } from "@/db/drizzle";
import { product, businessMember } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

export async function getProducts() {
  const businessId = await getBusinessId();
  return db.query.product.findMany({
    where: eq(product.businessId, businessId),
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
}

export async function createProduct(data: { name: string, description?: string, basePrice: number, variants?: any, isActive: boolean }) {
  const businessId = await getBusinessId();
  
  await db.insert(product).values({
    id: `prd_${crypto.randomUUID()}`,
    businessId,
    name: data.name,
    description: data.description,
    basePrice: data.basePrice,
    variants: data.variants,
    isActive: data.isActive,
  });
  revalidatePath("/dashboard/products");
}

export async function updateProductStatus(id: string, isActive: boolean) {
  const businessId = await getBusinessId();
  await db.update(product)
    .set({ isActive })
    .where(and(eq(product.id, id), eq(product.businessId, businessId)));
  revalidatePath("/dashboard/products");
}

export async function deleteProduct(id: string) {
  const businessId = await getBusinessId();
  await db.delete(product)
    .where(and(eq(product.id, id), eq(product.businessId, businessId)));
  revalidatePath("/dashboard/products");
}
