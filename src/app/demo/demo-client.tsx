"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function DemoClient({ endpoint, formName }: { endpoint: string; formName: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        const text = await res.text();
        alert(`Failed to submit form: ${text}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black">
        <div className="max-w-md w-full bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-3">You&apos;re on the list!</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            Your lead was successfully injected into Attract CRM. Go check your dashboard to see the magic happen in real-time.
          </p>
          <Button onClick={() => window.location.href = '/dashboard/leads'} className="w-full bg-white text-black hover:bg-zinc-200">
            View in Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black -z-10" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
      
      <main className="container mx-auto px-6 py-24 lg:py-32 grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        {/* Left Column: Copy */}
        <div className="space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            <span>Next-Gen Lead Capture</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Supercharge your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">conversion</span> rates.
          </h1>
          <p className="text-lg lg:text-xl text-zinc-400 max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            This is a live demo of the Attract Web Form Channel. Enter your details below and watch as the lead instantly populates your CRM, perfectly attributed to your session.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-6 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><Zap className="w-5 h-5" /></div>
              <div>
                <h4 className="font-medium">Instant Sync</h4>
                <p className="text-sm text-zinc-500 mt-1">Leads appear in your dashboard instantly via API.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400"><ShieldCheck className="w-5 h-5" /></div>
              <div>
                <h4 className="font-medium">Bot Protection</h4>
                <p className="text-sm text-zinc-500 mt-1">Built-in honeypot keeps the spam out automatically.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="relative z-10 lg:pl-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 blur-3xl -z-10 rounded-full" />
          <div className="bg-zinc-950/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Form Header */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">Connect with us</h3>
              <p className="text-sm text-zinc-400">Powered by {formName}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* HONEYPOT - Hidden from users, trips bots */}
              <div className="absolute opacity-0 -left-[9999px] pointer-events-none" aria-hidden="true">
                <Label htmlFor="_trap">Do not fill</Label>
                <Input type="text" id="_trap" name="_trap" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="Steve Jobs" 
                  className="bg-zinc-900/50 border-white/10 focus-visible:ring-indigo-500 h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-300">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel"
                  required 
                  placeholder="+1 (555) 000-0000" 
                  className="bg-zinc-900/50 border-white/10 focus-visible:ring-indigo-500 h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email Address (Optional)</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  placeholder="steve@apple.com" 
                  className="bg-zinc-900/50 border-white/10 focus-visible:ring-indigo-500 h-12 text-base"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 text-base font-medium bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
              >
                {isSubmitting ? "Processing..." : (
                  <>Claim Your Spot <ArrowRight className="ml-2 w-4 h-4" /></>
                )}
              </Button>
            </form>
            
            {/* API Endpoint Hint */}
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] text-zinc-500 font-mono break-all">
                Submitting securely to: {endpoint}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
