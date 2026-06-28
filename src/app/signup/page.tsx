"use client";
import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
          router.push("/dashboard");
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
            <label htmlFor="name" className="text-xs font-medium">Full Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} type="text" required placeholder="Your name" className="input-base h-10" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium">Work Email</label>
            <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@business.com" className="input-base h-10" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium">Password</label>
            <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Min. 8 characters" className="input-base h-10" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full h-10 text-sm">
            {loading ? "Creating..." : "Create Workspace"}
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account? <a href="/login" className="text-primary hover:underline font-medium">Log in</a>
        </p>
      </div>
    </div>
  );
}
