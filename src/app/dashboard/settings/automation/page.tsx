"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Plus, Trash2, GitBranch, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
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
import {
  getAutomationRules,
  createAutomationRule,
  toggleAutomationRule,
  deleteAutomationRule,
} from "@/actions/automation";
import type { AutomationRule } from "@/types";

const triggerOptions = ["Lead Created", "Status Changed", "No Response (5 min)", "Order Created", "Order Shipped"];
const actionOptions = [
  { label: "Send Message", value: "send_message" as const },
  { label: "Assign Agent", value: "assign_agent" as const },
  { label: "Send Notification", value: "notify" as const },
  { label: "Change Status", value: "change_status" as const },
];

const triggerValue = (label: string) => label.toLowerCase().replace(/[^a-z]/g, "-");

const triggerLabel = (value: string) =>
  triggerOptions.find((t) => triggerValue(t) === value) || value;

const actionLabel = (value: string) =>
  actionOptions.find((a) => a.value === value)?.label || value;

function RuleCard({
  rule,
  onToggle,
  onDelete,
}: {
  rule: AutomationRule;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const displayName =
    rule.name || `${triggerLabel(rule.trigger)} → ${actionLabel(rule.actionType)}`;

  return (
    <Card key={rule.id} className="border-border/60">
      <div className="p-4 flex items-center gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            IF {triggerLabel(rule.trigger).toLowerCase()} → THEN{" "}
            {actionLabel(rule.actionType).toLowerCase()}
          </p>
        </div>
        <Switch
          checked={rule.isActive}
          onCheckedChange={(checked) => onToggle(rule.id, checked)}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(rule.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}

export default function AutomationSettingsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [saving, setSaving] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [actionType, setActionType] = useState("");
  const [conditions, setConditions] = useState("");
  const [actionConfig, setActionConfig] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAutomationRules();
      setRules(data);
    } catch {
      // Rules will just be empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const resetForm = () => {
    setName("");
    setTrigger("");
    setActionType("");
    setConditions("");
    setActionConfig("");
    setIsActive(true);
  };

  const handleCreate = async () => {
    if (!trigger || !actionType) return;
    setSaving(true);
    try {
      await createAutomationRule({
        name: name || undefined,
        trigger,
        actionType: actionType as "send_message" | "assign_agent" | "notify" | "change_status",
        conditions: conditions ? JSON.parse(conditions) : undefined,
        actionConfig: actionConfig ? JSON.parse(actionConfig) : undefined,
        isActive,
      });
      setShowBuilder(false);
      resetForm();
      await fetchRules();
    } catch (e) {
      // swallow — the UI stays open so user can retry
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ruleId: string, active: boolean) => {
    try {
      await toggleAutomationRule(ruleId, active);
      setRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, isActive: active } : r)),
      );
    } catch {
      // revert optimistic update handled by refetch if needed
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!window.confirm("Are you sure you want to delete this automation rule?"))
      return;
    try {
      await deleteAutomationRule(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
    } catch {
      // swallow
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
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            Automation <Bot className="h-5 w-5 text-indigo-500" />
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure IF-THEN rules to automate workflows.
          </p>
        </div>
        <Dialog
          open={showBuilder}
          onOpenChange={(open) => {
            setShowBuilder(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <GitBranch className="h-4 w-4" /> New Automation Rule
              </DialogTitle>
              <DialogDescription className="text-xs">
                Build an IF-THEN rule for your business.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Rule Name</Label>
                <Input
                  placeholder="e.g. Auto-assign premium leads"
                  className="h-9 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">IF Trigger</Label>
                  <Select value={trigger} onValueChange={setTrigger}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Choose trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map((t) => (
                        <SelectItem key={t} value={triggerValue(t)}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">THEN Action</Label>
                  <Select value={actionType} onValueChange={setActionType}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Choose action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionOptions.map((a) => (
                        <SelectItem key={a.value} value={a.value}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Conditions (JSON, optional)</Label>
                <Textarea
                  placeholder='{"channel": "WhatsApp", "min_value": 100000}'
                  className="text-sm min-h-[60px] font-mono text-xs"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Action Config</Label>
                <Textarea
                  placeholder='{"message": "Halo, admin akan segera menghubungi Anda."}'
                  className="text-sm min-h-[60px] font-mono text-xs"
                  value={actionConfig}
                  onChange={(e) => setActionConfig(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3 bg-muted/20">
                <div>
                  <p className="text-xs font-medium">Activate immediately</p>
                  <p className="text-[11px] text-muted-foreground">
                    Rule will start executing once saved.
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={() => setShowBuilder(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-9 text-xs"
                  disabled={saving || !trigger || !actionType}
                  onClick={handleCreate}
                >
                  {saving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  Save Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading rules...
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No automation rules yet.</p>
            <p className="text-xs">Click &quot;New Rule&quot; to create your first one.</p>
          </div>
        ) : (
          rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
