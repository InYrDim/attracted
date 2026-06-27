import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — Attract",
  description: "Create a new Attract workspace.",
};

export default function SignupPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-lg font-bold mb-3">A</div>
          <h1 className="text-xl font-semibold tracking-tight">Create your workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">Start managing your leads in one place.</p>
        </div>
        <form className="space-y-3" action="/api/auth/sign-up/email" method="POST">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-medium">Full Name</label>
            <input id="name" name="name" type="text" required placeholder="Your name" className="input-base h-10" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium">Work Email</label>
            <input id="email" name="email" type="email" required placeholder="you@business.com" className="input-base h-10" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium">Password</label>
            <input id="password" name="password" type="password" required placeholder="Min. 8 characters" className="input-base h-10" />
          </div>
          <button type="submit" className="btn-primary w-full h-10 text-sm">Create Workspace</button>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account? <a href="/login" className="text-primary hover:underline font-medium">Log in</a>
        </p>
      </div>
    </div>
  );
}
