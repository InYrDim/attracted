"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const breadcrumbs: Record<string, { parent: string; current: string }> = {
  "/dashboard/inbox": { parent: "Dashboard", current: "Inbox" },
  "/dashboard/leads": { parent: "CRM", current: "Leads" },
};

export function AppHeader() {
  const pathname = usePathname();
  const crumb = breadcrumbs[pathname];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      <div className="flex items-center gap-2">
        {crumb ? (
          <>
            <span className="text-xs text-muted-foreground">{crumb.parent}</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-medium">{crumb.current}</span>
          </>
        ) : (
          <span className="text-sm font-medium capitalize">{pathname.split("/").pop()}</span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads, orders..." className="h-9 w-64 rounded-md pl-8 text-sm bg-muted/50" />
        </div>
        <button className="relative rounded-md p-2 hover:bg-accent transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  );
}
