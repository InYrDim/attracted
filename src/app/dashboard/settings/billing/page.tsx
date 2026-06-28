"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Receipt, Crown, CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const plans = [
  { name: "Starter", price: "Free", members: 1, channels: 1, automations: 5, current: false },
  { name: "Growth", price: "Rp 299K/mo", members: 3, channels: 3, automations: 20, current: true },
  { name: "Pro", price: "Rp 799K/mo", members: 10, channels: 10, automations: "Unlimited", current: false },
];

const invoices = [
  { id: "INV-001", date: "2025-06-01", amount: "Rp 299.000", status: "paid", plan: "Growth" },
  { id: "INV-002", date: "2025-05-01", amount: "Rp 299.000", status: "paid", plan: "Growth" },
  { id: "INV-003", date: "2025-04-01", amount: "Rp 299.000", status: "paid", plan: "Growth" },
];

export default function BillingSettingsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your subscription and invoices.</p>
        </div>
      </div>

      <Card className="border-border/60 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><CreditCard className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium">Current Plan: Growth</p>
              <p className="text-xs text-muted-foreground mt-0.5">Renews on July 1, 2025 • Rp 299.000/month</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="h-8 text-xs">Manage Subscription</Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={cn("border-border/60 relative", plan.current && "ring-2 ring-primary")}>
            {plan.current && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full">CURRENT</span>}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2"><Crown className="h-4 w-4 text-amber-500" /><h3 className="text-sm font-semibold">{plan.name}</h3></div>
              <p className="text-2xl font-bold tracking-tight">{plan.price}</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>{plan.members} team member{plan.members > 1 ? "s" : ""}</p>
                <p>{plan.channels} channel{plan.channels > 1 ? "s" : ""}</p>
                <p>{plan.automations} automation rule{plan.automations !== 1 && typeof plan.automations === "number" ? "s" : ""}</p>
              </div>
              <Button variant={plan.current ? "secondary" : "default"} size="sm" className="w-full h-9 text-xs" disabled={plan.current}>
                {plan.current ? "Current Plan" : "Upgrade"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Invoice History</h2>
        <Card className="border-border/60">
          <div className="divide-y divide-border/60">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent"><Receipt className="h-3.5 w-3.5 text-muted-foreground" /></div>
                  <div>
                    <p className="text-xs font-medium">{inv.id}</p>
                    <p className="text-[11px] text-muted-foreground">{inv.date} • {inv.plan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium">{inv.amount}</span>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-0"><CheckCircle2 className="h-3 w-3 mr-1 inline" />{inv.status}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3 w-3 text-muted-foreground" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
