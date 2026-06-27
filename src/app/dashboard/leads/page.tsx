"use client";
import { useState } from "react";
import { MoreVertical, UserPlus, ArrowRight, Plus, Search, Filter, LayoutList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const columns = [
  { id: "new_lead", label: "New Lead" },
  { id: "contacted", label: "Contacted" },
  { id: "interested", label: "Interested" },
  { id: "order", label: "Order" },
  { id: "delivered", label: "Delivered" },
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
  WhatsApp: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Instagram: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  TikTok: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
  "Web Form": "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
};

const leadCards: Record<string, { id: number; name: string; channel: string; source: string; time: string; status: string; value?: string; agent?: string }[]> = {
  new_lead: [
    { id: 1, name: "Siti Nurhaliza", channel: "WhatsApp", source: "Summer Sale Campaign", time: "2m ago", status: "new_lead" },
    { id: 2, name: "Budi Santoso", channel: "Web Form", source: "Promo Ramadhan", time: "1h ago", status: "new_lead" },
    { id: 3, name: "Rendi Pratama", channel: "TikTok", source: "Flash Sale Ad", time: "3h ago", status: "new_lead" },
    { id: 4, name: "Anisa Rahma", channel: "WhatsApp", source: "Referral", time: "5h ago", status: "new_lead" },
  ],
  contacted: [
    { id: 5, name: "Ahmad Rizki", channel: "Instagram", source: "Brand Post", time: "15m ago", status: "contacted", agent: "Rina" },
    { id: 6, name: "Dewi Sartika", channel: "WhatsApp", source: "IG Reels", time: "1h ago", status: "contacted", agent: "Budi" },
  ],
  interested: [
    { id: 7, name: "Maya Putri", channel: "WhatsApp", source: "New Arrival Ad", time: "2h ago", status: "interested", agent: "Sari", value: "Rp 450K" },
    { id: 8, name: "Putu Adi", channel: "Instagram", source: "Story Highlight", time: "4h ago", status: "interested", agent: "Rina", value: "Rp 299K" },
  ],
  order: [
    { id: 9, name: "Gita Permata", channel: "WhatsApp", source: "Summer Sale", time: "6h ago", status: "order", agent: "Budi", value: "Rp 750K" },
  ],
  delivered: [
    { id: 10, name: "Hendra Wijaya", channel: "Web Form", source: "Landing Page", time: "1d ago", status: "delivered", agent: "Sari" },
  ],
};

function LeadCard({ card, status }: { card: typeof leadCards.new_lead[0]; status: string }) {
  const initials = card.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <div className="group rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{card.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{card.source}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="shrink-0 rounded-md p-1 opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Assign Agent</DropdownMenuItem>
            <DropdownMenuItem>Change Status</DropdownMenuItem>
            <DropdownMenuItem>Create Order</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0", channelColors[card.channel])}>{card.channel}</Badge>
          <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0", columnColors[status])}>{status.replace("_", " ")}</Badge>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {card.agent && (
            <span className="flex items-center gap-1">
              <UserPlus className="h-3 w-3" />
              {card.agent}
            </span>
          )}
          <span>{card.time}</span>
        </div>
      </div>
      {card.value && (
        <div className="mt-2 pt-2 border-t border-border/60">
          <p className="text-xs font-medium text-foreground">Potential: <span className="text-emerald-600 dark:text-emerald-400">{card.value}</span></p>
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track your leads across the pipeline.</p>
        </div>
        <Button size="sm" className="h-9 gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Lead
        </Button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
          {columns.map((col) => {
            const cards = leadCards[col.id] || [];
            return (
              <div key={col.id} className="min-w-[220px] flex flex-col">
                <div className="flex items-center justify-between px-1 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">{col.label}</h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">{cards.length}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 rounded-lg bg-muted/20 p-2 min-h-[calc(100dvh-260px)]">
                  {cards.map((card) => (
                    <LeadCard key={card.id} card={card} status={col.id} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card divide-y divide-border/60">
          {Object.values(leadCards).flat()
            .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))
            .map((card) => (
              <div key={card.id} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors cursor-pointer group" >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold">
                  {card.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{card.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{card.source}</p>
                </div>
                <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0 hidden sm:inline-flex", channelColors[card.channel])}>{card.channel}</Badge>
                <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0", columnColors[card.status])}>{card.status.replace("_"," ")}</Badge>
                <span className="text-xs text-muted-foreground w-20 text-right">{card.time}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-md p-1 opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
                      <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Assign Agent</DropdownMenuItem>
                    <DropdownMenuItem>Change Status</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
