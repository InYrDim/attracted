"use client";

import { useState } from "react";
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, MessageSquare, ShoppingCart, UserPlus, MoreVertical, Clock, Tag, ExternalLink, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateLeadStatus } from "@/actions/leads";
import { LeadWithRelations, Message } from "@/types";

const statusColors: Record<string, string> = {
  new_lead: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  contacted: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  interested: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  order: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  delivered: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  lost: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export function LeadDetailClient({ initialLead, initialMessages }: { initialLead: LeadWithRelations; initialMessages: Message[] }) {
  const [msgText, setMsgText] = useState("");
  const [status, setStatus] = useState(initialLead.status);
  
  const initials = initialLead.name.split(" ").map((n: string) => n[0]).join("");
  const channelType = initialLead.channel?.type || "webform";
  const channelName = initialLead.channel?.name || "Unknown";

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await updateLeadStatus(initialLead.id, newStatus as any);
  };

  const timeline = [
    { time: new Date(initialLead.createdAt).toLocaleString(), event: `Lead created from ${channelName}`, by: "System" },
  ];

  return (
    <div className="h-[calc(100dvh-56px)] flex flex-col">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0 bg-background">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <a href="/dashboard/leads"><ArrowLeft className="h-4 w-4" /></a>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold truncate">{initialLead.name}</h1>
            <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0 rounded", statusColors[status])}>{status.replace("_", " ")}</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">Lead #{initialLead.id}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(statusColors).map((s) => (
                <SelectItem key={s} value={s} className="text-xs">{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Full Profile</DropdownMenuItem>
              <DropdownMenuItem>Create Order</DropdownMenuItem>
              <DropdownMenuItem>Merge Lead</DropdownMenuItem>
              <DropdownMenuItem>Mark as Lost</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 min-h-0">
        <div className="lg:col-span-2 flex flex-col border-r border-border">
          <Tabs defaultValue="conversation" className="flex-1 flex flex-col">
            <div className="shrink-0 border-b border-border px-4">
              <TabsList className="bg-transparent h-11 p-0 gap-4">
                <TabsTrigger value="conversation" className="h-11 px-1 text-xs border-b-2 border-transparent data-[state=active]:border-primary rounded-none">Conversation</TabsTrigger>
                <TabsTrigger value="timeline" className="h-11 px-1 text-xs border-b-2 border-transparent data-[state=active]:border-primary rounded-none">Timeline</TabsTrigger>
                <TabsTrigger value="orders" className="h-11 px-1 text-xs border-b-2 border-transparent data-[state=active]:border-primary rounded-none">Orders ({(initialLead.orders || []).length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="conversation" className="flex-1 flex flex-col m-0 data-[state=active]:flex">
              <ScrollArea className="flex-1 px-4">
                <div className="py-4 space-y-4 max-w-2xl mx-auto">
                  {initialMessages.length === 0 ? (
                     <div className="text-center text-sm text-muted-foreground mt-10">No messages yet. Say hi!</div>
                  ) : initialMessages.map((msg, i) => (
                    <div key={i} className={cn("flex", msg.senderType === "agent" ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5 text-sm", msg.senderType === "agent" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm")}>
                        <p className="leading-relaxed">{msg.content}</p>
                        <p className={cn("text-[10px] mt-1", msg.senderType === "agent" ? "text-primary-foreground/70 text-right" : "text-muted-foreground")}>
                           {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="shrink-0 border-t border-border p-3 bg-muted/10">
                <div className="flex items-end gap-2 max-w-3xl mx-auto">
                  <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 text-muted-foreground">
                    <Send className="h-4 w-4 rotate-90" />
                  </Button>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type a message..."
                      className="min-h-[40px] max-h-[120px] rounded-xl border-muted-foreground/20 bg-background resize-none"
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                    />
                  </div>
                  <Button size="sm" className="h-9 rounded-md px-4">Send</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="flex-1 m-0 data-[state=active]:flex">
              <ScrollArea className="flex-1 px-4">
                <div className="py-4 max-w-2xl mx-auto space-y-0">
                  {timeline.map((item, i) => (
                    <div key={i} className="flex gap-4 pb-6 relative">
                      {i !== timeline.length - 1 && <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />}
                      <div className="relative z-10 mt-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.event}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">{item.time}</span>
                          <span className="text-[11px] text-muted-foreground">• {item.by}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="orders" className="flex-1 m-0 data-[state=active]:flex">
              <ScrollArea className="flex-1 px-4">
                <div className="py-4 max-w-2xl mx-auto">
                  {(initialLead.orders || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm font-medium">No orders yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Create an order from this lead to get started.</p>
                      <Button size="sm" className="mt-3 h-8 text-xs gap-1.5"><ShoppingCart className="h-3 w-3" /> Create Order</Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(initialLead.orders || []).map((order) => (
                        <div key={order.id} className="rounded-lg border border-border p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
                          <div>
                            <p className="text-sm font-medium">{order.id}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString()} • {order.totalPrice}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0 rounded", statusColors[order.status])}>{order.status}</Badge>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3 w-3 text-muted-foreground" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden lg:flex flex-col bg-muted/10 overflow-y-auto">
          <div className="p-5 border-b border-border space-y-4">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Lead Information</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm font-semibold">{initials}</div>
              <div>
                <p className="text-sm font-medium">{initialLead.name}</p>
                <p className="text-[11px] text-muted-foreground">Via {channelName}</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {initialLead.phone && <div className="flex items-center gap-2.5 text-xs"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span>{initialLead.phone}</span></div>}
              {initialLead.email && <div className="flex items-center gap-2.5 text-xs"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span>{initialLead.email}</span></div>}
            </div>
          </div>
          <div className="p-5 border-b border-border space-y-3">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Assigned Agent</h3>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold">
                 {initialLead.assignedAgent?.user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-sm font-medium">{initialLead.assignedAgent?.user?.name || "Unassigned"}</p>
                <p className="text-[11px] text-muted-foreground">CS Agent</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full h-9 text-xs justify-start gap-2"><Phone className="h-3.5 w-3.5" /> Call Lead</Button>
              <Button variant="secondary" className="w-full h-9 text-xs justify-start gap-2"><ShoppingCart className="h-3.5 w-3.5" /> Create Order</Button>
              <Button variant="secondary" className="w-full h-9 text-xs justify-start gap-2"><UserPlus className="h-3.5 w-3.5" /> Reassign Agent</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
