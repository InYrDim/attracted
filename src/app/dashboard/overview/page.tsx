"use client";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Inbox,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Activity,
  Target,
  Clock,
  Zap,
  MessageCircle,
  Globe,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Bar,
  BarChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { InstagramIcon } from "@/components/icons/lucide-instagram";
const leadTrendData = [
  { day: "Mon", leads: 24, closed: 5 },
  { day: "Tue", leads: 18, closed: 3 },
  { day: "Wed", leads: 32, closed: 7 },
  { day: "Thu", leads: 28, closed: 6 },
  { day: "Fri", leads: 41, closed: 9 },
  { day: "Sat", leads: 15, closed: 2 },
  { day: "Sun", leads: 12, closed: 1 },
];
const channelData = [
  { name: "WhatsApp", value: 58, color: "#4f46e5" },
  { name: "Instagram", value: 24, color: "#06b6d4" },
  { name: "TikTok", value: 12, color: "#ec4899" },
  { name: "Web Form", value: 6, color: "#f59e0b" },
];
const revenueData = [
  { day: "Mon", revenue: 3200000 },
  { day: "Tue", revenue: 2100000 },
  { day: "Wed", revenue: 4500000 },
  { day: "Thu", revenue: 3800000 },
  { day: "Fri", revenue: 6100000 },
  { day: "Sat", revenue: 1800000 },
  { day: "Sun", revenue: 1200000 },
];
const dbLeads = [
  {
    id: 1,
    name: "Siti Nurhaliza",
    channel: { type: "whatsapp" },
    status: "new_lead" as const,
    source: "Meta Campaign: Summer Sale",
    phone: "08123456789",
    email: "siti@example.com",
    createdAt: "2023-10-01",
  },
  {
    id: 2,
    name: "Ahmad Rizki",
    channel: { type: "instagram" },
    status: "contacted" as const,
    source: "IG DM: Brand Post",
    phone: "08129876543",
    email: "ahmad@example.com",
    createdAt: "2023-10-02",
  },
  {
    id: 3,
    name: "Dewi Sartika",
    channel: { type: "whatsapp" },
    status: "interested" as const,
    source: "TikTok Ad: Flash Sale",
    phone: "08134567890",
    email: "dewi@example.com",
    createdAt: "2023-10-03",
  },
  {
    id: 4,
    name: "Budi Santoso",
    channel: { type: "webform" },
    status: "new_lead" as const,
    source: "Landing: Promo Ramadhan",
    phone: "08139876543",
    email: "budi@example.com",
    createdAt: "2023-10-04",
  },
  {
    id: 5,
    name: "Maya Putri",
    channel: { type: "whatsapp" },
    status: "order" as const,
    source: "Meta Campaign: New Arrival",
    phone: "08145678901",
    email: "maya@example.com",
    createdAt: "2023-10-05",
  },
];
const statusColors: Record<string, string> = {
  new_lead:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  contacted: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  interested:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  order:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  delivered: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  lost: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};
const tf = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
const formatRevenue = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : `${(n / 1_000).toFixed(0)}K`;
function StatCard({
  label,
  value,
  change,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: "up" | "down" | "neutral";
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Icon className="h-5 w-5" />
          </div>
          {trend !== "neutral" && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {" "}
              {trend === "up" ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {change}
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Business performance for the last 7 days.
        </p>
      </div>
      <Tabs defaultValue="7d" className="w-full">
        <TabsList className="bg-muted/60 h-9 rounded-md p-0.5">
          <TabsTrigger value="24h" className="h-7 text-xs rounded-sm">
            24h
          </TabsTrigger>
          <TabsTrigger value="7d" className="h-7 text-xs rounded-sm">
            7 days
          </TabsTrigger>
          <TabsTrigger value="30d" className="h-7 text-xs rounded-sm">
            30 days
          </TabsTrigger>
          <TabsTrigger value="90d" className="h-7 text-xs rounded-sm">
            90 days
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Leads"
          value="1,482"
          change="+12.5%"
          icon={Users}
          trend="up"
        />
        <StatCard
          label="Revenue"
          value={tf(32600000)}
          change="+8.2%"
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          label="Inbox Messages"
          value="384"
          change="+4.1%"
          icon={Inbox}
          trend="up"
        />
        <StatCard
          label="Avg Response"
          value="4m 32s"
          change="-1.3m"
          icon={Clock}
          trend="up"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Lead Trend</CardTitle>
            </div>
            <Tabs>
              <TabsList className="bg-muted/60 h-7 rounded-md p-0.5">
                <TabsTrigger
                  value="leads"
                  className="h-6 text-[11px] px-2 rounded-sm"
                >
                  Leads
                </TabsTrigger>
                <TabsTrigger
                  value="closed"
                  className="h-6 text-[11px] px-2 rounded-sm"
                >
                  Closed
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="px-1 pb-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={leadTrendData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/60"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [
                    value,
                    name === "leads" ? "New Leads" : "Closed",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="url(#leadGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Channel Split</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="none"
                  dataKey="value"
                >
                  {" "}
                  {channelData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value}%`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col gap-1.5">
              {channelData.map((ch) => (
                <div key={ch.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: ch.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {ch.name}
                  </span>
                  <span className="text-xs font-medium">{ch.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </div>
            <Badge
              variant="secondary"
              className="text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
            >
              {" "}
              +8.2% this week{" "}
            </Badge>
          </CardHeader>
          <CardContent className="px-1 pb-0">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={revenueData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/60"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatRevenue(v)}
                />
                <Tooltip
                  formatter={(value) => [tf(value as number), "Revenue"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                title: "Peak hour: 2–4 PM",
                desc: "61% of leads arrive during this window. Schedule your agents accordingly.",
              },
              {
                title: "WhatsApp CPL down 18%",
                desc: "Competing ad campaigns are outperforming baseline. Consider increasing Meta spend.",
              },
              {
                title: "3 leads stuck in contacted",
                desc: "Siti Nurhaliza (2 days), Ahmad Rizki (1 day), Dewi Sartika (5 hours). Follow up recommended.",
              },
              {
                title: "Top product: Paket Premium",
                desc: "Contributes 42% of revenue this week. Consider bundling with Paket Basic.",
              },
            ].map((insight, i) => (
              <div
                key={i}
                className="group flex gap-3 rounded-md border border-transparent p-2.5 transition-colors hover:border-border hover:bg-accent/30"
              >
                {" "}
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 text-[10px] font-bold">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {insight.desc}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="border-border/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Leads</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            {" "}
            View all{" "}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-lg border border-border bg-card">
            <Table className="w-full text-left text-sm">
              <TableHeader>
                <TableRow className="border-b border-border text-xs text-muted-foreground">
                  <TableHead className="px-4 py-2.5 font-medium h-auto">
                    Lead Name
                  </TableHead>
                  <TableHead className="px-4 py-2.5 font-medium h-auto hidden sm:table-cell">
                    Contact
                  </TableHead>
                  <TableHead className="px-4 py-2.5 font-medium h-auto hidden md:table-cell">
                    Channel
                  </TableHead>
                  <TableHead className="px-4 py-2.5 font-medium h-auto">
                    Status
                  </TableHead>
                  <TableHead className="px-4 py-2.5 font-medium h-auto hidden lg:table-cell text-right">
                    Date
                  </TableHead>
                  <TableHead className="px-4 py-2.5 font-medium h-auto w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {dbLeads.slice(0, 10).map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="group transition-colors hover:bg-accent/30 border-b-0"
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-[10px] font-semibold shrink-0">
                          {lead.name.substring(0, 2).toUpperCase()}
                        </div>
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="font-medium text-xs hover:underline truncate max-w-[120px] sm:max-w-none"
                        >
                          {lead.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                      {lead.phone || lead.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {lead.channel?.type === "whatsapp" && (
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                        {lead.channel?.type === "instagram" && (
                          <InstagramIcon className="h-3.5 w-3.5 text-pink-500" />
                        )}
                        {lead.channel?.type === "webform" && (
                          <Globe className="h-3.5 w-3.5 text-blue-500" />
                        )}

                        {(!lead.channel?.type ||
                          lead.channel?.type === "tiktok") && (
                          <div className="h-3.5 w-3.5 rounded-full bg-zinc-800" />
                        )}
                        <span className="capitalize">
                          {lead.channel?.type || "Manual"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={cn(
                          "badge text-[10px]",
                          statusColors[lead.status],
                        )}
                      >
                        {lead.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-xs text-muted-foreground hidden lg:table-cell">
                      {new Date(lead.createdAt).toLocaleDateString("en-US")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Message</DropdownMenuItem>
                          <DropdownMenuItem>Create Order</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
