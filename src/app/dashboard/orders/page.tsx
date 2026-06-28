import { getOrders } from "@/actions/orders";
import { getLeads } from "@/actions/leads";
import { getProducts } from "@/actions/products";
import { OrdersClient } from "./orders-client";

export default async function OrdersPage() {
  const [orders, leads, products] = await Promise.all([
    getOrders(),
    getLeads(),
    getProducts()
  ]);

  return <OrdersClient initialOrders={orders} leads={leads} products={products} />;
}
