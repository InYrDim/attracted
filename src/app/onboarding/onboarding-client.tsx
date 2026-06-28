"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { updateBusinessOnboardingStep, completeOnboarding } from "@/actions/onboarding";
// ponytail: step data read from onboardingData jsonb; when steps grow, extract to step-specific schema + validation.
const STEPS = [
  { id: 1, title: "Business Details", subtitle: "Name your workspace" },
  { id: 2, title: "First Product", subtitle: "Add a product (optional)" },
  { id: 3, title: "First Channel", subtitle: "Connect a channel (optional)" },
  { id: 4, title: "Invite Team", subtitle: "Add teammates (optional)" },
  { id: 5, title: "Connect Ad Account", subtitle: "Link ads (optional)" },
  { id: 6, title: "All Set!", subtitle: "You're ready to go" },
];

export function OnboardingClient({
  initialStep,
  initialData,
}: {
  initialStep: number;
  initialData: Record<string, unknown>;
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [saving, setSaving] = useState(false);

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  async function saveAndGo(next: number, payload?: Record<string, unknown>) {
    setSaving(true);
    try {
      const merged = { ...data, ...payload };
      await updateBusinessOnboardingStep(next, merged);
      setData(merged);
      if (next > STEPS.length) {
        await completeOnboarding();
        router.push("/dashboard/inbox");
        router.refresh();
      } else {
        setStep(next);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function skip(to?: number) {
    const next = to ?? step + 1;
    await saveAndGo(next, { [`step${step}_skipped`]: true });
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-lg font-bold mb-1">A</div>
          <h1 className="text-xl font-semibold tracking-tight">Set up your workspace</h1>
          <p className="text-sm text-muted-foreground">Step {step} of {STEPS.length} — {STEPS[step - 1]?.title}</p>
        </div>
        <Progress value={progress} className="h-2" />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{STEPS[step - 1]?.title}</CardTitle>
            <CardDescription>{STEPS[step - 1]?.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && <StepBusinessDetails data={data} onSave={(d) => saveAndGo(2, d)} saving={saving} />}
            {step === 2 && <StepFirstProduct data={data} onSave={(d) => saveAndGo(3, d)} onSkip={() => skip(3)} saving={saving} />}
            {step === 3 && <StepFirstChannel data={data} onSave={(d) => saveAndGo(4, d)} onSkip={() => skip(4)} saving={saving} />}
            {step === 4 && <StepInviteTeam data={data} onSave={(d) => saveAndGo(5, d)} onSkip={() => skip(5)} saving={saving} />}
            {step === 5 && <StepAdAccount data={data} onSave={(d) => saveAndGo(6, d)} onSkip={() => skip(6)} saving={saving} />}
            {step === 6 && <StepComplete onFinish={() => saveAndGo(STEPS.length + 1)} saving={saving} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StepBusinessDetails({
  data,
  onSave,
  saving,
}: {
  data: Record<string, unknown>;
  onSave: (d: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [name, setName] = useState((data.businessName as string) ?? "");
  const [slug, setSlug] = useState((data.businessSlug as string) ?? "");

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="biz-name" className="text-xs font-medium">Business Name</Label>
        <Input id="biz-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Business" required className="h-10" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="biz-slug" className="text-xs font-medium">Slug</Label>
        <Input id="biz-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-business" required className="h-10" />
      </div>
      <Button className="w-full h-10 text-sm" disabled={!name || !slug || saving} onClick={() => onSave({ businessName: name, businessSlug: slug })}>
        {saving ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}

function StepFirstProduct({
  onSave,
  onSkip,
  saving,
}: {
  data: Record<string, unknown>;
  onSave: (d: Record<string, unknown>) => void;
  onSkip: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Add your first product to start tracking sales. You can always add more later.</p>
      <div className="space-y-1.5">
        <Label htmlFor="prod-name" className="text-xs font-medium">Product Name</Label>
        <Input id="prod-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Paket Premium" className="h-10" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="prod-price" className="text-xs font-medium">Base Price (IDR)</Label>
        <Input id="prod-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="50000" className="h-10" />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-10 text-sm" onClick={onSkip} disabled={saving}>Skip</Button>
        <Button className="flex-1 h-10 text-sm" disabled={!name || !price || saving} onClick={() => onSave({ productName: name, productPrice: Number(price) })}>
          {saving ? "Saving..." : "Add & Continue"}
        </Button>
      </div>
    </div>
  );
}

function StepFirstChannel({
  onSave,
  onSkip,
  saving,
}: {
  data: Record<string, unknown>;
  onSave: (d: Record<string, unknown>) => void;
  onSkip: () => void;
  saving: boolean;
}) {
  const [channelType, setChannelType] = useState("whatsapp");
  const [channelName, setChannelName] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Connect a channel to receive leads. WhatsApp is the most popular choice.</p>
      <div className="space-y-1.5">
        <Label htmlFor="ch-type" className="text-xs font-medium">Channel Type</Label>
        <select
          id="ch-type"
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={channelType}
          onChange={(e) => setChannelType(e.target.value)}
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="webform">Web Form</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ch-name" className="text-xs font-medium">Channel Name</Label>
        <Input id="ch-name" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="e.g. Main WhatsApp" className="h-10" />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-10 text-sm" onClick={onSkip} disabled={saving}>Skip</Button>
        <Button className="flex-1 h-10 text-sm" disabled={!channelName || saving} onClick={() => onSave({ channelType, channelName })}>
          {saving ? "Saving..." : "Add & Continue"}
        </Button>
      </div>
    </div>
  );
}

function StepInviteTeam({
  onSave,
  onSkip,
  saving,
}: {
  data: Record<string, unknown>;
  onSave: (d: Record<string, unknown>) => void;
  onSkip: () => void;
  saving: boolean;
}) {
  const [email, setEmail] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Invite your team members to collaborate. They&apos;ll get access to leads, orders, and reports.</p>
      <div className="space-y-1.5">
        <Label htmlFor="invite-email" className="text-xs font-medium">Email Address</Label>
        <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@business.com" className="h-10" />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-10 text-sm" onClick={onSkip} disabled={saving}>Skip</Button>
        <Button className="flex-1 h-10 text-sm" disabled={!email || saving} onClick={() => onSave({ invitedEmail: email })}>
          {saving ? "Saving..." : "Invite & Continue"}
        </Button>
      </div>
    </div>
  );
}

function StepAdAccount({
  onSave,
  onSkip,
  saving,
}: {
  data: Record<string, unknown>;
  onSave: (d: Record<string, unknown>) => void;
  onSkip: () => void;
  saving: boolean;
}) {
  const [platform, setPlatform] = useState("meta");
  const [accountId, setAccountId] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Connect your ad account to track campaign performance automatically.</p>
      <div className="space-y-1.5">
        <Label htmlFor="ad-platform" className="text-xs font-medium">Platform</Label>
        <select
          id="ad-platform"
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option value="meta">Meta (Facebook/Instagram)</option>
          <option value="tiktok">TikTok</option>
          <option value="google">Google</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ad-account-id" className="text-xs font-medium">Account ID</Label>
        <Input id="ad-account-id" value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="e.g. 1234567890" className="h-10" />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-10 text-sm" onClick={onSkip} disabled={saving}>Skip</Button>
        <Button className="flex-1 h-10 text-sm" disabled={!accountId || saving} onClick={() => onSave({ adPlatform: platform, adAccountId: accountId })}>
          {saving ? "Saving..." : "Connect & Continue"}
        </Button>
      </div>
    </div>
  );
}

function StepComplete({
  onFinish,
  saving,
}: {
  onFinish: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-3 text-center">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <span className="text-3xl">🎉</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Your workspace is all set up. You can now manage leads, track sales, and collaborate with your team.
      </p>
      <Button className="w-full h-10 text-sm" onClick={onFinish} disabled={saving}>
        {saving ? "Finishing..." : "Go to Inbox"}
      </Button>
    </div>
  );
}
