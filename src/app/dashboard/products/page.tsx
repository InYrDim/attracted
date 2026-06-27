"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Search, Package, MoreVertical, Edit, Trash2, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const products = [
  { id: "PRD-001", name: "Paket Premium", price: "Rp 450.000", variants: "Size: S, M, L", status: "active", sold: 234, revenue: "Rp 105.3M" },
  { id: "PRD-002", name: "Paket Basic", price: "Rp 299.000", variants: "Color: White, Black, Navy", status: "active", sold: 189, revenue: "Rp 56.5M" },
  { id: "PRD-003", name: "Paket Starter", price: "Rp 199.000", variants: "—", status: "active", sold: 145, revenue: "Rp 28.9M" },
  { id: "PRD-004", name: "Add-on Support 24/7", price: "Rp 75.000", variants: "Duration: 1mo, 3mo, 6mo", status: "inactive", sold: 67, revenue: "Rp 5.0M" },
  { id: "PRD-005", name: "Paket Enterprise", price: "Rp 1.200.000", variants: "Custom", status: "active", sold: 12, revenue: "Rp 14.4M" },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your product catalog and pricing.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base">New Product</DialogTitle>
              <DialogDescription className="text-xs">Add a product or service to your catalog.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5"><Label className="text-xs">Product Name</Label><Input placeholder="e.g. Paket Premium" className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea placeholder="Brief description..." className="text-sm min-h-[60px]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Base Price (IDR)</Label><Input placeholder="450000" className="h-9 text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Status</Label><Select defaultValue="active"><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Variants (JSON)</Label><Textarea placeholder='[{"name": "Size", "options": ["S","M","L"]}]' className="text-sm min-h-[60px] font-mono text-xs" /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" className="h-9 text-xs">Cancel</Button>
                <Button size="sm" className="h-9 text-xs">Save Product</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search products..." className="h-9 pl-8 rounded-md text-sm bg-muted/50" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-border text-xs text-muted-foreground font-medium">
          <div className="col-span-4">Product</div>
          <div className="col-span-2 hidden md:block">Variants</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right hidden sm:block">Sold</div>
          <div className="col-span-2 text-right hidden md:block">Revenue</div>
          <div className="col-span-1 text-right">Status</div>
          <div className="col-span-1 w-10"></div>
        </div>
        {products.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase())).map((product) => (
          <div key={product.id} className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center border-b border-border/60 last:border-0 group hover:bg-accent/30 transition-colors">
            <div className="col-span-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent"><Package className="h-4 w-4 text-muted-foreground" /></div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-[11px] text-muted-foreground">{product.id}</p>
              </div>
            </div>
            <div className="col-span-2 text-xs text-muted-foreground truncate hidden md:block">{product.variants}</div>
            <div className="col-span-2 text-right text-xs font-medium">{product.price}</div>
            <div className="col-span-2 text-right text-xs text-muted-foreground hidden sm:block">{product.sold}</div>
            <div className="col-span-2 text-right text-xs hidden md:block">{product.revenue}</div>
            <div className="col-span-1 text-right">
              <span className={cn("badge text-[10px] h-4 px-1.5 border-0", product.status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>{product.status}</span>
            </div>
            <div className="col-span-1 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-md p-1 opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"><MoreVertical className="h-3.5 w-3.5 text-muted-foreground" /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem><Edit className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem>
                  <DropdownMenuItem><EyeOff className="h-3.5 w-3.5 mr-2" />{product.status === "active" ? "Deactivate" : "Activate"}</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
