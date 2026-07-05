"use client";

import { useState, useCallback } from "react";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Trash2,
  Power,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getAdAccounts, addAdAccount, removeAdAccount, toggleAdAccountStatus } from "@/actions/ads";

type AdAccountRow = {
  id: string;
  platform: "meta" | "tiktok" | "google";
  accountId: string;
  isActive: boolean;
  createdAt: string;
  campaignCount: number;
};

const PLATFORM_META: Record<AdAccountRow["platform"], { label: string; emoji: string }> = {
  meta: { label: "Meta Ads", emoji: "📘" },
  tiktok: { label: "TikTok Ads", emoji: "🎵" },
  google: { label: "Google Ads", emoji: "🔍" },
};

import { toast } from "sonner";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to connect ad account";
}

export default function AdsClient({
  initialAccounts,
}: {
  initialAccounts: AdAccountRow[];
}) {
  const [accounts, setAccounts] = useState<AdAccountRow[]>(initialAccounts);
  const [loading, setLoading] = useState(false);

  // Connect dialog
  const [connectOpen, setConnectOpen] = useState(false);
  const [platform, setPlatform] = useState<AdAccountRow["platform"]>("meta");
  const [platformAccountId, setPlatformAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Disconnect dialog
  const [disconnectId, setDisconnectId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdAccounts();
      setAccounts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConnect = async () => {
    if (!platformAccountId.trim() || !accessToken.trim()) return;
    setSubmitting(true);
    try {
      await addAdAccount(platform, platformAccountId, accessToken);
      setConnectOpen(false);
      setPlatform("meta");
      setPlatformAccountId("");
      setAccessToken("");
      toast.success("Ad account connected successfully");
      await refresh();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectId) return;
    try {
      await removeAdAccount(disconnectId);
      setDisconnectId(null);
      await refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleAdAccountStatus(id, !current);
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !current } : a)),
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ad Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect ad accounts to track attribution and send CAPI events.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border/60">
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-px w-full" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="space-y-1 text-center">
                      <Skeleton className="h-4 w-16 mx-auto" />
                      <Skeleton className="h-3 w-10 mx-auto" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((ad) => {
            const info = PLATFORM_META[ad.platform];
            return (
              <Card key={ad.id} className="border-border/60">
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-lg">
                        {info.emoji}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {info.label}{" "}
                          <span className="text-muted-foreground font-mono text-[10px]">
                            ({ad.accountId.slice(0, 12)})
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {info.label}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] h-4 px-1.5 border-0",
                        ad.isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
                      )}
                    >
                      {ad.isActive ? "active" : "inactive"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-sm font-semibold">
                        {ad.campaignCount}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Campaigns
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">—</p>
                      <p className="text-[10px] text-muted-foreground">Spend</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">—</p>
                      <p className="text-[10px] text-muted-foreground">Leads</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 text-xs flex-1"
                      onClick={() => handleToggle(ad.id, ad.isActive)}
                    >
                      <Power className="h-3 w-3 mr-1.5" />
                      {ad.isActive ? "Pause" : "Activate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDisconnectId(ad.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          <Card
            className="border-dashed border-border/60 flex flex-col items-center justify-center p-8 min-h-[120px] cursor-pointer hover:bg-accent/20 transition-colors"
            onClick={() => setConnectOpen(true)}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Plus className="h-4 w-4" /> Connect another account
            </div>
          </Card>
        </div>
      )}

      {!loading && accounts.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No ad accounts connected yet. Click above to connect your first
          account.
        </p>
      )}

      {/* Connect Dialog */}
      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Ad Account</DialogTitle>
            <DialogDescription>
              Add a Meta, TikTok, or Google Ads account to start tracking
              performance. For Meta, use the Ad Account ID and Marketing API
              access token, not the App ID or App Secret.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={platform}
                onValueChange={(v) =>
                  setPlatform(v as AdAccountRow["platform"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meta">Meta Ads</SelectItem>
                  <SelectItem value="tiktok">TikTok Ads</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Account ID</Label>
                {platform === "meta" && (
                  <a href="https://business.facebook.com/settings/ad-accounts" target="_blank" rel="noreferrer" className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                    Find Account ID <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <Input
                placeholder={platform === "meta" ? "e.g., act_123456789" : "Enter account ID"}
                value={platformAccountId}
                onChange={(e) => setPlatformAccountId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Access Token</Label>
                {platform === "meta" && (
                  <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noreferrer" className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                    Generate Token <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <Input
                type="password"
                placeholder={platform === "meta" ? "Marketing API access token, not App Secret" : "Paste your access token"}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConnectOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={submitting || !platformAccountId || !accessToken}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirm */}
      <AlertDialog
        open={!!disconnectId}
        onOpenChange={(o) => !o && setDisconnectId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the ad account and all its campaigns from your
              dashboard. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect}>
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
