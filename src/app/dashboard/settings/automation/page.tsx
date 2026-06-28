"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Plus, ToggleLeft, ToggleRight, Play, Pause, Trash2, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const triggerOptions = ["Lead Created", "Status Changed", "No Response (5 min)", "Order Created", "Order Shipped"];
const actionOptions = ["Send Message", "Assign Agent", "Change Status", "Send Notification"];

const rules = [
  { id: "r-1", name: "Auto-reply new lead", trigger: "Lead Created", action: "Send Message", active: true, runs: 342 },
  { id: "r-2", name: "Escalate stuck leads", trigger: "No Response (5 min)", action: "Send Notification", active: true, runs: 28 },
  { id: "r-3", name: "Assign by product", trigger: "Lead Created", action: "Assign Agent", active: false, runs: 0 },
];

export default function AutomationSettingsPage() {
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">Automation <Bot className="h-5 w-5 text-indigo-500" /></h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure IF-THEN rules to automate workflows.</p>
        </div>
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 gap-1.5"><Plus className="h-3.5 w-3.5" /> New Rule</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2"><GitBranch className="h-4 w-4" /> New Automation Rule</DialogTitle>
              <DialogDescription className="text-xs">Build an IF-THEN rule for your business.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-3">
              <div className="space-y-1.5"><Label className="text-xs">Rule Name</Label><Input placeholder="e.g. Auto-assign premium leads" className="h-9 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">IF Trigger</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choose trigger" /></SelectTrigger><SelectContent>{triggerOptions.map(t => <SelectItem key={t} value={t.toLowerCase().replace(/[^a-z]/g,"-")}>{t}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">THEN Action</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choose action" /></SelectTrigger><SelectContent>{actionOptions.map(a => <SelectItem key={a} value={a.toLowerCase().replace(/[^a-z]/g,"-")}>{a}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Conditions (JSON, optional)</Label><Textarea placeholder='{"channel": "WhatsApp", "min_value": 100000}' className="text-sm min-h-[60px] font-mono text-xs" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Action Config</Label><Textarea placeholder='{"message": "Halo, admin akan segera menghubungi Anda."}' className="text-sm min-h-[60px] font-mono text-xs" /></div>
              <div className="flex items-center justify-between rounded-md border border-border p-3 bg-muted/20">
                <div><p className="text-xs font-medium">Activate immediately</p><p className="text-[11px] text-muted-foreground">Rule will start executing once saved.</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => setShowBuilder(false)}>Cancel</Button>
                <Button size="sm" className="h-9 text-xs">Save Rule</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {rules.map((rule) => (
          <Card key={rule.id} className="border-border/60">
            <div className="p-4 flex items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent"><GitBranch className="h-4 w-4 text-muted-foreground" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{rule.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">IF {rule.trigger.toLowerCase()} → THEN {rule.action.toLowerCase()} • {rule.runs} runs</p>
              </div>
              <Switch checked={rule.active} onCheckedChange={() => {}} />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Pause className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
