"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Search, Package, MoreVertical, Edit, Trash2, EyeOff, Loader2 } from "lucide-react";
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
import { createProduct, updateProductStatus, deleteProduct } from "@/actions/products";
import { Product } from "@/types";

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    basePrice: "",
    status: "active",
    variants: ""
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let parsedVariants = null;
    try {
      if (newProduct.variants.trim()) {
        parsedVariants = JSON.parse(newProduct.variants);
      }
    } catch(err) {
      alert("Invalid JSON in variants field");
      setIsSubmitting(false);
      return;
    }
    
    await createProduct({
      name: newProduct.name,
      description: newProduct.description,
      basePrice: parseInt(newProduct.basePrice) || 0,
      variants: parsedVariants,
      isActive: newProduct.status === "active"
    });
    
    setIsSubmitting(false);
    setIsCreateOpen(false);
    setNewProduct({ name: "", description: "", basePrice: "", status: "active", variants: "" });
  };
  
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await updateProductStatus(id, !currentStatus);
  };
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your product catalog and pricing.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base">New Product</DialogTitle>
              <DialogDescription className="text-xs">Add a product or service to your catalog.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProduct} className="space-y-3 pt-2">
              <div className="space-y-1.5"><Label className="text-xs">Product Name</Label><Input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Paket Premium" className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Brief description..." className="text-sm min-h-[60px]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Base Price (IDR)</Label><Input required type="number" value={newProduct.basePrice} onChange={e => setNewProduct({...newProduct, basePrice: e.target.value})} placeholder="450000" className="h-9 text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Status</Label>
                <Select value={newProduct.status} onValueChange={v => setNewProduct({...newProduct, status: v})}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                </Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Variants (JSON)</Label><Textarea value={newProduct.variants} onChange={e => setNewProduct({...newProduct, variants: e.target.value})} placeholder='[{"name": "Size", "options": ["S","M","L"]}]' className="text-sm min-h-[60px] font-mono text-xs" /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setIsCreateOpen(false)} variant="outline" size="sm" className="h-9 text-xs">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} size="sm" className="h-9 text-xs">{isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Product"}</Button>
              </div>
            </form>
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
          <div className="col-span-1 text-right">Status</div>
          <div className="col-span-1 w-10"></div>
        </div>
        {initialProducts.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase())).map((product) => (
          <div key={product.id} className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center border-b border-border/60 last:border-0 group hover:bg-accent/30 transition-colors">
            <div className="col-span-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent"><Package className="h-4 w-4 text-muted-foreground" /></div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{product.description || product.id}</p>
              </div>
            </div>
            <div className="col-span-2 text-xs text-muted-foreground truncate hidden md:block">
              {product.variants && Array.isArray(product.variants) && product.variants.length > 0 ? JSON.stringify(product.variants).substring(0, 30) + "..." : "—"}
            </div>
            <div className="col-span-2 text-right text-xs font-medium">
              Rp {product.basePrice.toLocaleString("id-ID")}
            </div>
            <div className="col-span-2 text-right text-xs text-muted-foreground hidden sm:block">0</div>
            <div className="col-span-1 text-right">
              <span className={cn("badge text-[10px] h-4 px-1.5 border-0 rounded", product.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>{product.isActive ? "Active" : "Inactive"}</span>
            </div>
            <div className="col-span-1 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-md p-1 opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"><MoreVertical className="h-3.5 w-3.5 text-muted-foreground" /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleToggleStatus(product.id, product.isActive)}>
                    <EyeOff className="h-3.5 w-3.5 mr-2" />{product.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        
        {initialProducts.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No products found. Add your first product to get started.
          </div>
        )}
      </div>
    </div>
  );
}
