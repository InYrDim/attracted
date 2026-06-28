"use server";
import { db } from "@/db/drizzle";
import { product } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireBusinessMember } from "@/lib/auth-utils";
import crypto from "crypto";

export async function getProducts() {
  const { businessId } = await requireBusinessMember("agent");
  return db.query.product.findMany({
    where: eq(product.businessId, businessId),
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
}

export async function createProduct(data: { name: string; description?: string; basePrice: number; variants?: unknown; isActive: boolean }) {
  const { businessId } = await requireBusinessMember("admin");

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
  const { businessId } = await requireBusinessMember("admin");
  await db.update(product)
    .set({ isActive })
    .where(and(eq(product.id, id), eq(product.businessId, businessId)));
  revalidatePath("/dashboard/products");
}

export async function deleteProduct(id: string) {
  const { businessId } = await requireBusinessMember("admin");
  await db.delete(product)
    .where(and(eq(product.id, id), eq(product.businessId, businessId)));
  revalidatePath("/dashboard/products");
}