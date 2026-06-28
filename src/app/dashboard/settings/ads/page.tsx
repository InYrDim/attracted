"use client";

import { useState } from "react";
import { ArrowLeft, Plug, RadioTower, ExternalLink, CheckCircle2, XCircle, RefreshCw, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const adAccounts = [
  { id: "ad-001", platform: "Meta Ads", name: "Attract Main Account", status: "connected", spend: "Rp 4.200.000", leads: 184, cpl: "Rp 22.800" },
  { id: "ad-002", platform: "TikTok Ads", name: "Summer Sale 2025", status: "connected", spend: "Rp 2.100.000", leads: 89, cpl: "Rp 23.600" },
  { id: "ad-003", platform: "Google Ads", name: "Brand Keywords", status: "disconnected", spend: "Rp 0", leads: 0, cpl: "—" },
];

export default function AdsSettingsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ad Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Connect ad accounts to track attribution and send CAPI events.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adAccounts.map((ad) => (
          <Card key={ad.id} className="border-border/60">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-lg">
                    {ad.platform === "Meta Ads" ? "📘" : ad.platform === "TikTok Ads" ? "🎵" : "🔍"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{ad.name}</p>
                    <p className="text-[11px] text-muted-foreground">{ad.platform}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0", ad.status === "connected" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400")}>
                  {ad.status}
                </Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-semibold">{ad.spend}</p>
                  <p className="text-[10px] text-muted-foreground">Ad Spend</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">{ad.leads}</p>
                  <p className="text-[10px] text-muted-foreground">Leads</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">{ad.cpl}</p>
                  <p className="text-[10px] text-muted-foreground">CPL</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="secondary" size="sm" className="h-8 text-xs flex-1"><Plug className="h-3 w-3 mr-1.5" />{ad.status === "connected" ? "Manage" : "Connect"}</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><ExternalLink className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="border-dashed border-border/60 flex flex-col items-center justify-center p-8 min-h-[120px] cursor-pointer hover:bg-accent/20 transition-colors">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Plus className="h-4 w-4" /> Connect another account</div>
      </Card>
    </div>
  );
}
