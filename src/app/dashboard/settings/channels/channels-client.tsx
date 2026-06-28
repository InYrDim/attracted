"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Trash2, ExternalLink, CheckCircle2, Copy } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createWebFormChannel, createInstagramChannel, createWhatsAppChannel, deleteChannel } from "@/actions/channels";
import { Channel } from "@/types";

export default function ChannelsClient({ initialChannels }: { initialChannels: Channel[] }) {
  const [channels, setChannels] = useState(initialChannels);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  
  const [formName, setFormName] = useState("");
  const [requireEmail, setRequireEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [igName, setIgName] = useState("");
  const [igAccountId, setIgAccountId] = useState("");
  const [igToken, setIgToken] = useState("");
  const [igVerifyToken, setIgVerifyToken] = useState("");

  const [waName, setWaName] = useState("");
  const [waPhoneNumberId, setWaPhoneNumberId] = useState("");
  const [waToken, setWaToken] = useState("");
  const [waVerifyToken, setWaVerifyToken] = useState("");

  const handleCreateForm = async () => {
    if (!formName.trim()) return;
    setIsSubmitting(true);
    try {
      await createWebFormChannel({ name: formName, requireEmail });
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInstagram = async () => {
    if (!igName.trim() || !igAccountId.trim() || !igToken.trim() || !igVerifyToken.trim()) return;
    setIsSubmitting(true);
    try {
      await createInstagramChannel({
        name: igName,
        igAccountId,
        accessToken: igToken,
        verifyToken: igVerifyToken
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateWhatsapp = async () => {
    if (!waName.trim() || !waPhoneNumberId.trim() || !waToken.trim() || !waVerifyToken.trim()) return;
    setIsSubmitting(true);
    try {
      await createWhatsAppChannel({
        name: waName,
        phoneNumberId: waPhoneNumberId,
        accessToken: waToken,
        verifyToken: waVerifyToken
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this channel?")) {
      try {
        await deleteChannel(id);
        window.location.reload();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

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
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2">
        {channels.map((ch) => {
          const config = ch.config as any;
          return (
            <Card key={ch.id} className="border-border/60">
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-lg">
                      {ch.type === "whatsapp" ? "💬" : ch.type === "instagram" ? "📸" : ch.type === "tiktok" ? "🎵" : "📝"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{ch.name}</p>
                      <p className="text-[11px] text-muted-foreground uppercase">{ch.type}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] h-4 px-1.5 border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1 inline" />Connected
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {ch.type === "webform" && config?.endpoint && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] truncate max-w-[200px]">Endpoint: {config.endpoint}</span>
                      <button onClick={() => copyToClipboard(window.location.origin + config.endpoint)} className="hover:text-foreground">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {ch.type === "whatsapp" && (
                    <div className="space-y-1">
                      <p>WhatsApp Channel</p>
                      {config?.webhookUrl && (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] truncate max-w-[200px]">Webhook: {config.webhookUrl}</span>
                          <button onClick={() => copyToClipboard(window.location.origin + config.webhookUrl)} className="hover:text-foreground">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {ch.type === "instagram" && (
                    <div className="space-y-1">
                      <p>Instagram Channel ({config?.igAccountId})</p>
                      {config?.webhookUrl && (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] truncate max-w-[200px]">Webhook: {config.webhookUrl}</span>
                          <button onClick={() => copyToClipboard(window.location.origin + config.webhookUrl)} className="hover:text-foreground">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <p>Created: {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(ch.createdAt))}</p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {ch.type === "webform" && (
                    <>
                      <Button variant="secondary" size="sm" className="h-8 text-xs flex-1">Embed Code</Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs flex-1" asChild>
                        <Link href={`/demo/${ch.id}`}>Test Form</Link>
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(ch.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </Card>
          );
        })}

        <Card 
          className="border-border/60 border-dashed flex flex-col items-center justify-center p-8 min-h-[180px] cursor-pointer hover:bg-accent/20 transition-colors"
          onClick={() => setIsFormModalOpen(true)}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent mb-3">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Add Web Form</p>
          <p className="text-xs text-muted-foreground mt-1">Create an endpoint to capture leads</p>
        </Card>

        <Card 
          className="border-border/60 border-dashed flex flex-col items-center justify-center p-8 min-h-[180px] cursor-pointer hover:bg-accent/20 transition-colors"
          onClick={() => setIsInstagramModalOpen(true)}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent mb-3">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Connect Instagram</p>
          <p className="text-xs text-muted-foreground mt-1">Receive DMs in Unified Inbox</p>
        </Card>

        <Card 
          className="border-border/60 border-dashed flex flex-col items-center justify-center p-8 min-h-[180px] cursor-pointer hover:bg-accent/20 transition-colors"
          onClick={() => setIsWhatsappModalOpen(true)}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent mb-3">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Connect WhatsApp</p>
          <p className="text-xs text-muted-foreground mt-1">WhatsApp Business API</p>
        </Card>
      </div>

      <Dialog open={isWhatsappModalOpen} onOpenChange={setIsWhatsappModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect WhatsApp Business</DialogTitle>
            <DialogDescription>
              Connect via Meta Graph API to receive and reply to WhatsApp messages.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Channel Name</Label>
              <Input placeholder="e.g., WA Customer Service" value={waName} onChange={(e) => setWaName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number ID</Label>
              <Input placeholder="Phone Number ID (from Graph API)" value={waPhoneNumberId} onChange={(e) => setWaPhoneNumberId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>System User Access Token</Label>
              <Input type="password" placeholder="System user access token" value={waToken} onChange={(e) => setWaToken(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Webhook Verify Token</Label>
              <Input placeholder="Token for webhook challenge" value={waVerifyToken} onChange={(e) => setWaVerifyToken(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWhatsappModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateWhatsapp} disabled={isSubmitting || !waName || !waPhoneNumberId || !waToken || !waVerifyToken}>
              {isSubmitting ? "Connecting..." : "Connect WhatsApp"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInstagramModalOpen} onOpenChange={setIsInstagramModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Instagram Business</DialogTitle>
            <DialogDescription>
              Connect via Meta Graph API to receive and reply to DMs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Channel Name</Label>
              <Input placeholder="e.g., IG Official Store" value={igName} onChange={(e) => setIgName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Instagram Account ID</Label>
              <Input placeholder="IG account ID (from Graph API)" value={igAccountId} onChange={(e) => setIgAccountId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Page Access Token</Label>
              <Input type="password" placeholder="System user access token" value={igToken} onChange={(e) => setIgToken(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Webhook Verify Token</Label>
              <Input placeholder="Token for webhook challenge" value={igVerifyToken} onChange={(e) => setIgVerifyToken(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInstagramModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateInstagram} disabled={isSubmitting || !igName || !igAccountId || !igToken || !igVerifyToken}>
              {isSubmitting ? "Connecting..." : "Connect Instagram"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Web Form Channel</DialogTitle>
            <DialogDescription>
              Generate a unique API endpoint you can submit leads to from your landing page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Form Name</Label>
              <Input placeholder="e.g., Summer Promo Form" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="reqEmail" checked={requireEmail} onCheckedChange={(c) => setRequireEmail(!!c)} />
              <Label htmlFor="reqEmail" className="font-normal text-sm cursor-pointer">Require Email Address</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateForm} disabled={isSubmitting || !formName}>
              {isSubmitting ? "Creating..." : "Create Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
