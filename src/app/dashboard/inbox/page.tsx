"use client";
import { useState } from "react";
import { Search, Send, Paperclip, Smile, MoreVertical, Filter, Phone, User, MapPin, Tag, Clock, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
const conversations = [
  { id: 1, name: "Siti Nurhaliza", channel: "WhatsApp", initials: "SN", status: "new_lead", lastMessage: "Halo, saya tertarik dengan paket premium...", time: "2m", unread: 2 },
  { id: 2, name: "Ahmad Rizki", channel: "Instagram", initials: "AR", status: "contacted", lastMessage: "Terima kasih, saya akan cek dulu ya", time: "15m", unread: 0 },
  { id: 3, name: "Dewi Sartika", channel: "WhatsApp", initials: "DS", status: "interested", lastMessage: "Masih ada diskon untuk pembelian 2 paket?", time: "42m", unread: 1 },
  { id: 4, name: "Budi Santoso", channel: "Web Form", initials: "BS", status: "new_lead", lastMessage: "Saya mau daftar paket starter", time: "1h", unread: 0 },
  { id: 5, name: "Maya Putri", channel: "WhatsApp", initials: "MP", status: "order", lastMessage: "Sudah transaksi pakai OVO", time: "2h", unread: 0 },
  { id: 6, name: "Rendi Pratama", channel: "TikTok", initials: "RP", status: "new_lead", lastMessage: "Gimana cara order nya?", time: "3h", unread: 3 },
  { id: 7, name: "Lisa Anggraini", channel: "Instagram", initials: "LA", status: "lost", lastMessage: "Maaf saya belom bisa konfirmasi", time: "5h", unread: 0 },
];
const messages: Record<number, { from: "lead" | "agent"; text: string; time: string }[]> = {
  1: [
    { from: "lead", text: "Halo, saya lihat iklan di Instagram, ada paket premium kan?", time: "10:23 AM" },
    { from: "agent", text: "Halo Siti! Ya, ada paket premium seharga Rp 450.000/bulan. Mau tau lebih detail?", time: "10:25 AM" },
    { from: "lead", text: "Halo, saya tertarik dengan paket premium... Apa saja benefit nya?", time: "10:31 AM" },
  ],
  3: [
    { from: "agent", text: "Halo Bu Dewi, sesuai yang ditanyakan, saat ini kami ada promo untuk 2 paket.", time: "9:42 AM" },
    { from: "lead", text: "Masih ada diskon untuk pembelian 2 paket?", time: "9:45 AM" },
  ],
};
const channelColors: Record<string, string> = {
  WhatsApp: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Instagram: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  TikTok: "bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
  "Web Form": "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
};
const statusColors: Record<string, string> = {
  new_lead: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  contacted: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  interested: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  order: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  delivered: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  lost: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};
const templates = ["Halo, terima kasih sudah menghubungi kami!", "Baik, saya akan segera proses pesanan Anda.", "Ada yang bisa saya bantu?"];
export default function InboxPage() {
  const [selected, setSelected] = useState(conversations[0]);
  const [search, setSearch] = useState("");
  const [msgText, setMsgText] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const filtered = conversations.filter((c) => {
    if (filter && c.channel !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return (
    <div className="h-[calc(100dvh-56px)] flex">
      <div className="hidden md:flex w-80 flex-col border-r border-border bg-muted/20">
        <div className="p-3 space-y-2 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="h-8 pl-8 rounded-md text-xs bg-background" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {["WhatsApp", "Instagram", "TikTok", "Web Form"].map((ch) => (
              <button key={ch} onClick={() => setFilter(filter === ch ? null : ch)} className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors",
                filter === ch ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-border"
              )}>
                {ch}
              </button>
            ))}
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filtered.map((conv) => (
            <button key={conv.id} onClick={() => setSelected(conv)} className={cn(
              "flex w-full items-start gap-3 px-3 py-3 border-b border-border/40 transition-colors text-left",
              selected.id === conv.id ? "bg-accent/60 border-l-2 border-l-primary" : "hover:bg-accent/30 border-l-2 border-l-transparent"
            )}>
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {conv.initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium truncate">{conv.name}</p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{conv.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0", channelColors[conv.channel])}>
                    {conv.channel}
                  </Badge>
                  {conv.unread > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">{conv.unread}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </ScrollArea>
      </div>
      <div className="hidden md:flex flex-1 flex-col bg-background">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
          <button className="md:hidden mr-1">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold">{selected.initials}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{selected.name}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0", channelColors[selected.channel])}>{selected.channel}</Badge>
              <span className="text-[11px] text-muted-foreground capitalize">{selected.status.replace("_", " ")}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-3.5 w-3.5 text-muted-foreground" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Lead Profile</DropdownMenuItem>
                <DropdownMenuItem>Assign to Agent</DropdownMenuItem>
                <DropdownMenuItem>Create Order</DropdownMenuItem>
                <DropdownMenuItem>Change Status</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="py-4 space-y-4 max-w-2xl mx-auto">
            {(messages[selected.id] || []).map((msg, i) => (
              <div key={i} className={cn("flex", msg.from === "agent" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5 text-sm", msg.from === "agent" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm")}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={cn("text-[10px] mt-1", msg.from === "agent" ? "text-primary-foreground/70 text-right" : "text-muted-foreground")}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="shrink-0 border-t border-border p-3 bg-muted/10">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 text-muted-foreground"><Paperclip className="h-4 w-4" /></Button>
            <div className="flex-1 relative">
              <Input placeholder="Type a message..." className="h-10 pr-16 rounded-xl border-muted-foreground/20 bg-background" value={msgText} onChange={(e) => setMsgText(e.target.value)} />
              <div className="absolute right-1.5 bottom-1.5 flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md"><Smile className="h-4 w-4 text-muted-foreground" /></Button>
                <Button size="sm" className="h-7 rounded-md px-3">
                  <Send className="h-3.5 w-3.5" /> Send
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 mt-2 max-w-3xl mx-auto overflow-x-auto pb-0.5">
            {templates.map((t) => (
              <button key={t} onClick={() => setMsgText(t)} className="shrink-0 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-72 flex-col border-l border-border bg-muted/10">
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-3">Lead Context</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold">{selected.initials}</div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{selected.name}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{selected.status.replace("_", " ")}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Jakarta Selatan, DKI Jakarta</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground truncate">Meta Campaign: Summer Sale</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">First response in 8m</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <Button variant="secondary" className="w-full h-9 text-xs justify-start">
            <User className="h-3.5 w-3.5 mr-2" /> Assign Agent
          </Button>
          <Button variant="secondary" className="w-full h-9 text-xs justify-start">
            <Tag className="h-3.5 w-3.5 mr-2" /> Change Status
          </Button>
          <Button variant="secondary" className="w-full h-9 text-xs justify-start">
            <ArrowLeft className="h-3.5 w-3.5 mr-2 rotate-180" /> Create Order
          </Button>
        </div>
        <div className="p-4 border-t border-border">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-2">Ad Source</h3>
          <div className="rounded-md border border-border bg-background p-2.5 space-y-1.5">
            <p className="text-xs font-medium">Meta Campaign: Summer Sale 2025</p>
            <p className="text-[11px] text-muted-foreground">Ad Set: Jakarta Female 18-35</p>
            <p className="text-[11px] text-muted-foreground">Creative: Carousel 5 Slide</p>
            <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-0">CPL: Rp 8.200</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
