"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { acceptInvite } from "@/actions/team";

export default function InviteAcceptPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function handleAccept() {
      try {
        const result = await acceptInvite();
        if (!cancelled) {
          if (result.ok) {
            setStatus("success");
            setMessage("Invitation accepted! Redirecting to dashboard...");
            setTimeout(() => redirect("/dashboard"), 1500);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setStatus("error");
          const text = err instanceof Error ? err.message : "Failed to accept invitation";
          setMessage(text);
        }
      }
    }
    handleAccept();
    return () => { cancelled = true; };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Accepting invitation...</p>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="text-foreground">{message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <Card className="w-full max-w-md p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
        <p className="text-destructive">{message}</p>
        <Button variant="outline" className="mt-4" onClick={() => redirect("/login")}>
          Go to Login
        </Button>
      </Card>
    </div>
  );
}