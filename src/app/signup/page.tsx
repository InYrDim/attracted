"use client";
import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp.email({
      name,
      email,
      password,
      fetchOptions: {
        onSuccess: () => {
          router.push("/onboarding");
          router.refresh();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to sign up");
        }
      }
    });
    setLoading(false);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-lg font-bold mb-3">A</div>
          <h1 className="text-xl font-semibold tracking-tight">Create your workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">Start managing your leads in one place.</p>
        </div>
        <form className="space-y-3" onSubmit={handleSignup}>
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} type="text" required placeholder="Your name" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">Work Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@business.com" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium">Password</Label>
            <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Min. 8 characters" className="h-10" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-10 text-sm">
            {loading ? "Creating..." : "Create Workspace"}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
