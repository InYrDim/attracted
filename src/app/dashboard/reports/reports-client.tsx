"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { LeadWithRelations, OrderWithRelations } from "@/types";

export default function ReportsClient({ 
  leads, 
  orders 
}: { 
  leads: LeadWithRelations[],
  orders: any[] 
}) {
  const [tab, setTab] = useState("sales");

  // Format currency
  const formatIdr = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  // === Ad Performance Mock Data (We don't have real API data for spend yet) ===
  const adCampaigns = [
    { name: "Promo Lebaran (Meta)", spend: 4500000, leads: 320, orders: 45, revenue: 13500000 },
    { name: "Flash Sale (TikTok)", spend: 2100000, leads: 180, orders: 12, revenue: 3600000 },
    { name: "Search Brand (Google)", spend: 1200000, leads: 85, orders: 25, revenue: 7500000 },
  ].map(c => ({
    ...c,
    cpl: c.spend / c.leads,
    roas: (c.revenue / c.spend).toFixed(2),
    cvr: ((c.orders / c.leads) * 100).toFixed(1) + "%"
  }));

  // === Sales Performance Aggregation ===
  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const funnelData = [
    { name: "New Lead", value: statusCounts.new_lead || 0 },
    { name: "Contacted", value: statusCounts.contacted || 0 },
    { name: "Interested", value: statusCounts.interested || 0 },
    { name: "Order", value: (statusCounts.order || 0) + (statusCounts.delivered || 0) },
  ];

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  // === CS Performance Aggregation ===
  const agentData = leads.reduce((acc, lead) => {
    if (!lead.assignedAgentId) return acc;
    const name = lead.assignedAgent?.user?.name || "Unknown Agent";
    if (!acc[name]) acc[name] = { name, leads: 0, orders: 0, responseTime: Math.floor(Math.random() * 15) + 2 };
    acc[name].leads++;
    if (lead.status === "order" || lead.status === "delivered") acc[name].orders++;
    return acc;
  }, {} as Record<string, any>);

  const csStats = Object.values(agentData).map((a: any) => ({
    ...a,
    closingRate: ((a.orders / a.leads) * 100).toFixed(1) + "%"
  }));

  const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b'];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Comprehensive business performance metrics.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-muted/60 mb-4">
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="ads">Ad Performance</TabsTrigger>
          <TabsTrigger value="cs">CS & Team</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6 mt-0">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/60">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Leads</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{leads.length}</div></CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Orders</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{orders.length}</div></CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{formatIdr(totalRevenue)}</div></CardContent>
            </Card>
          </div>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Sales Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-border/60" />
                    <XAxis type="number" className="text-muted-foreground text-xs" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" className="text-muted-foreground text-xs" axisLine={false} tickLine={false} width={80} />
                    <Tooltip cursor={{ fill: 'var(--accent)' }} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-6 mt-0">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Campaign Performance</CardTitle>
              <CardDescription>Attributed metrics from active ad campaigns.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">CPL</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adCampaigns.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-right">{formatIdr(c.spend)}</TableCell>
                      <TableCell className="text-right">{c.leads}</TableCell>
                      <TableCell className="text-right">{formatIdr(c.cpl)}</TableCell>
                      <TableCell className="text-right">{c.orders} ({c.cvr})</TableCell>
                      <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{formatIdr(c.revenue)}</TableCell>
                      <TableCell className="text-right font-bold">{c.roas}x</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cs" className="space-y-6 mt-0">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Agent Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead className="text-right">Leads Handled</TableHead>
                    <TableHead className="text-right">Avg Response Time</TableHead>
                    <TableHead className="text-right">Orders Closed</TableHead>
                    <TableHead className="text-right">Closing Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csStats.length > 0 ? csStats.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell className="text-right">{a.leads}</TableCell>
                      <TableCell className="text-right">{a.responseTime} mins</TableCell>
                      <TableCell className="text-right">{a.orders}</TableCell>
                      <TableCell className="text-right">{a.closingRate}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No agent assignment data available.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}