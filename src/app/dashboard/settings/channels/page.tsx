"use client";

import { useState } from "react";
import { ArrowLeft, Plus, RadioTower, Plug, Trash2, ExternalLink, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const channels = [
  { id: "ch-001", type: "WhatsApp", name: "Main Support", status: "connected", lastActivity: "2m ago", phone: "+62 812-3456-7890" },
  { id: "ch-002", type: "Instagram", name: "Brand DM", status: "connected", lastActivity: "15m ago", handle: "@attractbrand" },
  { id: "ch-003", type: "TikTok", name: "Shop Inbox", status: "disconnected", lastActivity: "Never", handle: "@attractshop" },
  { id: "ch-004", type: "Web Form", name: "Landing Promo", status: "connected", lastActivity: "1h ago", endpoint: "/api/forms/abc123" },
];

export default function ChannelsSettingsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Channels</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Connect messaging channels to receive leads.</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/60 h-9 rounded-md p-0.5">
          <TabsTrigger value="all" className="h-7 text-xs rounded-sm">All Channels</TabsTrigger>
          <TabsTrigger value="connected" className="h-7 text-xs rounded-sm">Connected</TabsTrigger>
          <TabsTrigger value="disconnected" className="h-7 text-xs rounded-sm">Disconnected</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2">
        {channels.map((ch) => (
          <Card key={ch.id} className="border-border/60">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-lg">
                    {ch.type === "WhatsApp" ? "💬" : ch.type === "Instagram" ? "📸" : ch.type === "TikTok" ? "🎵" : "📝"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{ch.name}</p>
                    <p className="text-[11px] text-muted-foreground">{ch.type}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0", ch.status === "connected" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400")}>
                  {ch.status === "connected" ? <><CheckCircle2 className="h-3 w-3 mr-1 inline" />Connected</> : <><XCircle className="h-3 w-3 mr-1 inline" />Disconnected</>}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {ch.phone && <p>Phone: {ch.phone}</p>}
                {ch.handle && <p>Handle: {ch.handle}</p>}
                {ch.endpoint && <p className="font-mono text-[10px]">Endpoint: {ch.endpoint}</p>}
                <p>Last activity: {ch.lastActivity}</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button variant="secondary" size="sm" className="h-8 text-xs flex-1">Configure</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><ExternalLink className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </Card>
        ))}
        <Card className="border-border/60 border-dashed flex flex-col items-center justify-center p-8 min-h-[180px] cursor-pointer hover:bg-accent/20 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent mb-3"><Plus className="h-5 w-5 text-muted-foreground" /></div>
          <p className="text-sm font-medium">Add New Channel</p>
          <p className="text-xs text-muted-foreground mt-1">WhatsApp, Instagram, TikTok, or Form</p>
        </Card>
      </div>
    </div>
  );
}
