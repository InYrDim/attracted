"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { OrderWithRelations, LeadWithRelations, Product } from "@/types";
import { createOrder, updateOrderStatus } from "@/actions/orders";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  processing: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  shipped: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export function OrdersClient({
  initialOrders,
  leads,
  products,
}: {
  initialOrders: OrderWithRelations[];
  leads: LeadWithRelations[];
  products: Product[];
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New order state
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [address, setAddress] = useState("");
  const [courier, setCourier] = useState("");

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const total = selectedProduct ? selectedProduct.basePrice * qty : 0;

  const filtered = initialOrders.filter((o) => {
    if (tab !== "all" && o.status !== tab) return false;
    if (search && !o.lead?.name.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !selectedProductId) return;
    
    setIsCreating(true);
    await createOrder({
      leadId: selectedLeadId,
      items: [{ productId: selectedProductId, quantity: qty, price: selectedProduct!.basePrice }],
      totalPrice: total,
      shippingAddress: address,
      shippingCourier: courier,
    });
    
    setIsCreating(false);
    setIsCreateOpen(false);
    // reset
    setSelectedLeadId("");
    setSelectedProductId("");
    setQty(1);
    setAddress("");
    setCourier("");
  };

  const handleStatusChange = async (id: string, newStatus: any) => {
    await updateOrderStatus(id, newStatus);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and manage all orders.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 gap-1.5"><Plus className="h-3.5 w-3.5" /> New Order</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleCreateOrder}>
              <DialogHeader>
                <DialogTitle className="text-base">Create New Order</DialogTitle>
                <DialogDescription className="text-xs">Fill in the order details below.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 pt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Lead</Label>
                  <Select value={selectedLeadId} onValueChange={setSelectedLeadId} required>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select lead" /></SelectTrigger>
                    <SelectContent>
                      {leads.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Product</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId} required>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} - Rp {p.basePrice.toLocaleString("id-ID")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Quantity</Label>
                    <Input type="number" min="1" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)} className="h-9 text-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Total</Label>
                    <Input value={`Rp ${total.toLocaleString("id-ID")}`} disabled className="h-9 text-sm bg-muted" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Shipping Address</Label>
                  <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address..." className="text-sm min-h-[60px]" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Courier</Label>
                    <Select value={courier} onValueChange={setCourier}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select courier" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jne">JNE</SelectItem>
                        <SelectItem value="sicepat">Sicepat</SelectItem>
                        <SelectItem value="jnt">J&T Express</SelectItem>
                        <SelectItem value="gojek">Gojek</SelectItem>
                        <SelectItem value="grab">Grab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tracking #</Label>
                    <Input placeholder="Auto-generated or enter manually" disabled className="h-9 text-sm bg-muted" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="h-9 text-xs">Cancel</Button>
                  <Button type="submit" size="sm" disabled={isCreating} className="h-9 text-xs">{isCreating ? "Creating..." : "Create Order"}</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search orders..." className="h-9 pl-8 rounded-md text-sm bg-muted/50" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Tabs value={tab} onValueChange={setTab} className="w-auto">
          <TabsList className="bg-muted/60 h-8 rounded-md p-0.5">
            <TabsTrigger value="all" className="h-6 text-[11px] px-2.5 rounded-sm">All</TabsTrigger>
            <TabsTrigger value="pending" className="h-6 text-[11px] px-2.5 rounded-sm">Pending</TabsTrigger>
            <TabsTrigger value="processing" className="h-6 text-[11px] px-2.5 rounded-sm">Processing</TabsTrigger>
            <TabsTrigger value="shipped" className="h-6 text-[11px] px-2.5 rounded-sm">Shipped</TabsTrigger>
            <TabsTrigger value="delivered" className="h-6 text-[11px] px-2.5 rounded-sm">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table className="w-full text-left text-sm">
          <TableHeader>
            <TableRow className="border-b border-border text-xs text-muted-foreground">
              <TableHead className="px-4 py-2.5 font-medium h-auto">Order ID</TableHead>
              <TableHead className="px-4 py-2.5 font-medium h-auto">Lead</TableHead>
              <TableHead className="px-4 py-2.5 font-medium h-auto hidden md:table-cell">Items</TableHead>
              <TableHead className="px-4 py-2.5 font-medium h-auto hidden sm:table-cell">Courier</TableHead>
              <TableHead className="px-4 py-2.5 font-medium h-auto">Status</TableHead>
              <TableHead className="px-4 py-2.5 font-medium h-auto text-right">Total</TableHead>
              <TableHead className="px-4 py-2.5 font-medium h-auto text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No orders found.</TableCell>
              </TableRow>
            ) : filtered.map((order) => {
              const itemsCount = Array.isArray(order.items) ? order.items.length : 0;
              return (
                <TableRow key={order.id} className="group transition-colors hover:bg-accent/30 cursor-pointer border-b-0">
                  <TableCell className="px-4 py-3"><span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline">{order.id}</span></TableCell>
                  <TableCell className="px-4 py-3 font-medium">{order.lead?.name}</TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{itemsCount} item(s)</TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell uppercase">{order.shippingCourier || "—"}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                      <SelectTrigger className={cn("h-6 text-[10px] w-28 px-2 py-0 border-0 shadow-none font-medium", statusColors[order.status])}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-xs font-medium">Rp {order.totalPrice.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="px-4 py-3 text-right text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-US")}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
