"use client";

import { useState } from "react";
import { ArrowLeft, Package, Truck, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  processing: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  shipped: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const orders = [
  { id: "ORD-001", lead: "Siti Nurhaliza", product: "Paket Premium", qty: 1, total: "Rp 450.000", courier: "JNE", tracking: "JNE1234567890", status: "processing", date: "2025-06-20", address: "Jl. Sudirman No. 123, Jakarta Selatan" },
  { id: "ORD-002", lead: "Ahmad Rizki", product: "Paket Basic", qty: 2, total: "Rp 598.000", courier: "Sicepat", tracking: "", status: "pending", date: "2025-06-21", address: "Jl. Thamrin No. 45, Jakarta Pusat" },
  { id: "ORD-003", lead: "Dewi Sartika", product: "Paket Premium + Add-on", qty: 1, total: "Rp 575.000", courier: "J&T", tracking: "JT9876543210", status: "shipped", date: "2025-06-19", address: "Jl. Kuningan No. 8, Jakarta Selatan" },
  { id: "ORD-004", lead: "Budi Santoso", product: "Paket Starter", qty: 1, total: "Rp 199.000", courier: "", tracking: "", status: "delivered", date: "2025-06-15", address: "BSD City, Tangerang" },
];

export default function OrdersPage() {
  const [search, setSearch] = useState("");

  const filtered = orders.filter((o) => !search || o.lead.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and manage all orders.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 gap-1.5"><Plus className="h-3.5 w-3.5" /> New Order</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Create New Order</DialogTitle>
              <DialogDescription className="text-xs">Fill in the order details below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5"><Label className="text-xs">Lead</Label><Input placeholder="Search lead..." className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Product</Label><Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent><SelectItem value="premium">Paket Premium - Rp 450.000</SelectItem><SelectItem value="basic">Paket Basic - Rp 299.000</SelectItem><SelectItem value="starter">Paket Starter - Rp 199.000</SelectItem></SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Quantity</Label><Input type="number" defaultValue={1} className="h-9 text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Total</Label><Input value="Rp 450.000" disabled className="h-9 text-sm bg-muted" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Shipping Address</Label><Textarea placeholder="Full address..." className="text-sm min-h-[60px]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Courier</Label><Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select courier" /></SelectTrigger><SelectContent><SelectItem value="jne">JNE</SelectItem><SelectItem value="sicepat">Sicepat</SelectItem><SelectItem value="jnt">J&T Express</SelectItem></SelectContent></Select></div>
                <div className="space-y-1.5"><Label className="text-xs">Tracking #</Label><Input placeholder="Auto-generated" className="h-9 text-sm" /></div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" className="h-9 text-xs">Cancel</Button>
                <Button size="sm" className="h-9 text-xs">Create Order</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search orders..." className="h-9 pl-8 rounded-md text-sm bg-muted/50" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Tabs defaultValue="all" className="w-auto">
          <TabsList className="bg-muted/60 h-8 rounded-md p-0.5">
            <TabsTrigger value="all" className="h-6 text-[11px] px-2.5 rounded-sm">All</TabsTrigger>
            <TabsTrigger value="pending" className="h-6 text-[11px] px-2.5 rounded-sm">Pending</TabsTrigger>
            <TabsTrigger value="shipped" className="h-6 text-[11px] px-2.5 rounded-sm">Shipped</TabsTrigger>
            <TabsTrigger value="delivered" className="h-6 text-[11px] px-2.5 rounded-sm">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-lg border border-border bg-card divide-y divide-border/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Order ID</th>
              <th className="px-4 py-2.5 font-medium">Lead</th>
              <th className="px-4 py-2.5 font-medium hidden md:table-cell">Product</th>
              <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Courier</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium text-right">Total</th>
              <th className="px-4 py-2.5 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((order) => (
              <tr key={order.id} className="group transition-colors hover:bg-accent/30 cursor-pointer">
                <td className="px-4 py-3"><a href={`/dashboard/orders/${order.id}`} className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline">{order.id}</a></td>
                <td className="px-4 py-3 font-medium">{order.lead}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{order.product}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">{order.courier || "—"}</td>
                <td className="px-4 py-3"><span className={cn("badge text-[10px]", statusColors[order.status])}>{order.status}</span></td>
                <td className="px-4 py-3 text-right text-xs font-medium">{order.total}</td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
