"use client";
import { useState } from "react";
import { MoreVertical, UserPlus, Plus, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { updateLeadStatus } from "@/actions/leads";
import { LeadWithRelations } from "@/types";

const columns = [
  { id: "new_lead", label: "New Lead" },
  { id: "contacted", label: "Contacted" },
  { id: "interested", label: "Interested" },
  { id: "order", label: "Order" },
  { id: "delivered", label: "Delivered" },
  { id: "lost", label: "Lost" },
];

const columnColors: Record<string, string> = {
  new_lead: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  contacted: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  interested: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  order: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  delivered: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  lost: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const channelColors: Record<string, string> = {
  whatsapp: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  instagram: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  tiktok: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
  webform: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
};

function formatTimeAgo(dateStr: string | Date) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function LeadCard({ lead }: { lead: LeadWithRelations }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const initials = lead.name.split(" ").map((n: string) => n[0]).join("");
  const channelType = lead.channel?.type || "webform";
  const channelName = lead.channel?.name || "Unknown";
  
  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    await updateLeadStatus(lead.id, newStatus as any);
    setIsUpdating(false);
  };

  return (
    <div className={cn("group rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-md transition-all cursor-pointer", isUpdating && "opacity-50 pointer-events-none")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{lead.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{lead.phone || lead.email}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="shrink-0 rounded-md p-1 opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Assign Agent</DropdownMenuItem>
            {columns.map((c) => (
              <DropdownMenuItem key={c.id} onClick={() => handleStatusChange(c.id)} disabled={lead.status === c.id}>
                Move to {c.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0", channelColors[channelType] || channelColors.webform)}>
            {channelName}
          </Badge>
          <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0", columnColors[lead.status])}>
            {lead.status.replace("_", " ")}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {lead.assignedAgent && (
            <span className="flex items-center gap-1">
              <UserPlus className="h-3 w-3" />
              {lead.assignedAgent.user.name.split(" ")[0]}
            </span>
          )}
          <span>{formatTimeAgo(lead.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { createLead } from "@/actions/leads";

export function LeadsClient({ leads }: { leads: LeadWithRelations[] }) {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", phone: "", email: "" });

  const filteredLeads = leads.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    await createLead({ ...newLead }); // Channel handled in action
    setIsCreating(false);
    setIsCreateOpen(false);
    setNewLead({ name: "", phone: "", email: "" });
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track your leads across the pipeline.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Name</label>
                <Input required value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Phone Number</label>
                <Input required value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} placeholder="+62 812..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Email (Optional)</label>
                <Input type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} placeholder="john@example.com" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isCreating}>{isCreating ? "Saving..." : "Save Lead"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search leads..." className="h-9 pl-8 rounded-md text-sm bg-muted/50" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as "kanban" | "list")} className="border border-border rounded-md p-0.5">
            <ToggleGroupItem value="kanban" size="sm" className="h-7 text-xs px-2.5 rounded-sm">Board</ToggleGroupItem>
            <ToggleGroupItem value="list" size="sm" className="h-7 text-xs px-2.5 rounded-sm">List</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      {view === "kanban" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-4 items-start min-w-full w-max">
          {columns.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.id);
            return (
              <div key={col.id} className="min-w-[260px] flex flex-col">
                <div className="flex items-center justify-between px-1 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">{col.label}</h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">{colLeads.length}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 rounded-lg bg-muted/30 border border-border/50 p-2 min-h-[calc(100dvh-260px)]">
                  {colLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                  {colLeads.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-border/60 rounded-md flex items-center justify-center text-xs text-muted-foreground">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card divide-y divide-border/60">
          {filteredLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors cursor-pointer group" >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold">
                  {lead.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.phone}</p>
                </div>
                <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0 hidden sm:inline-flex", channelColors[lead.channel?.type || "webform"])}>{lead.channel?.name}</Badge>
                <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0", columnColors[lead.status])}>{lead.status.replace("_"," ")}</Badge>
                <span className="text-xs text-muted-foreground w-20 text-right">{formatTimeAgo(lead.createdAt)}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
