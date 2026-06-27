"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Mail, Shield, Crown, UserMinus, MoreVertical, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

const members = [
  { id: "m-1", name: "Andi Wijaya", email: "andi@business.com", role: "owner", status: "active", joined: "Jan 2025" },
  { id: "m-2", name: "Budi Rahardjo", email: "budi@business.com", role: "admin", status: "active", joined: "Feb 2025" },
  { id: "m-3", name: "Sari Indah", email: "sari@business.com", role: "agent", status: "active", joined: "Mar 2025" },
  { id: "m-4", name: "Rina Dewi", email: "rina@business.com", role: "agent", status: "pending", joined: "—" },
];

const roleConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  owner: { icon: <Crown className="h-3 w-3" />, color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400", label: "Owner" },
  admin: { icon: <Shield className="h-3 w-3" />, color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400", label: "Admin" },
  agent: { icon: <Mail className="h-3 w-3" />, color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400", label: "Agent" },
};

export default function TeamSettingsPage() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("agent");

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><a href="/dashboard"><ArrowLeft className="h-4 w-4" /></a></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage members and permissions.</p>
        </div>
      </div>

      <Card className="border-border/60">
        <div className="p-5 border-b border-border">
          <p className="text-sm font-medium">Invite Team Member</p>
          <p className="text-xs text-muted-foreground mt-0.5">Send an invitation via email.</p>
          <div className="flex items-center gap-2 mt-3">
            <Input placeholder="colleague@email.com" className="h-9 text-sm flex-1" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="h-9 text-sm w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="h-9 gap-1.5"><Send className="h-3.5 w-3.5" /> Invite</Button>
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {members.map((m) => {
            const role = roleConfig[m.role];
            return (
              <div key={m.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/30 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold">
                  {m.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
                </div>
                <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0 gap-1", role.color)}>{role.icon}{role.label}</Badge>
                <span className="text-[11px] text-muted-foreground w-20 text-right hidden sm:block">{m.joined}</span>
                <span className={cn("text-[10px] font-medium w-16 text-right", m.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>{m.status}</span>
                {m.role !== "owner" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><UserMinus className="h-3.5 w-3.5 mr-2" />Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
