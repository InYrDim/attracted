"use client";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn.email({
      email,
      password,
      fetchOptions: {
        onSuccess: () => {
          router.push("/dashboard");
          router.refresh();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to log in");
        }
      }
    });
    setLoading(false);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-lg font-bold mb-3">A</div>
          <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Log in to your Attract workspace.</p>
        </div>
        <form className="space-y-3" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium">Email</label>
            <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@business.com" className="input-base h-10" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium">Password</label>
            <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Enter password" className="input-base h-10" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full h-10 text-sm">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account? <a href="/signup" className="text-primary hover:underline font-medium">Sign up</a>
        </p>
      </div>
    </div>
  );
}
