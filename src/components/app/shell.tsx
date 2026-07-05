"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox, Users, ShoppingCart, Package, Settings2, ChevronLeft, ChevronRight, Bot, CreditCard, RadioTower, } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/inbox", label: "Inbox", icon: Inbox },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/reports", label: "Reports", icon: RadioTower },
  {
    label: "Settings",
    icon: Settings2,
    children: [
      { href: "/dashboard/settings/channels", label: "Channels", icon: RadioTower },
      { href: "/dashboard/settings/ads", label: "Ad Accounts", icon: RadioTower },
      { href: "/dashboard/settings/team", label: "Team", icon: Users },
      { href: "/dashboard/settings/automation", label: "Automation", icon: Bot, disabled: true },
      { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard, disabled: true },
    ],
  },
];

function SidebarItem({ item, pathname, collapsed }: { item: typeof navItems[0]; pathname: string; collapsed: boolean }) {
  const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href ?? "/dashboard/settings");
  
  if (item.children) {
    return (
      <div>
        <div
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground",
            collapsed && "justify-center px-2",
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </div>
        {!collapsed && (
          <div className="ml-7 mt-1 space-y-0.5 border-l border-border pl-3">
            {item.children.map((child) => {
              if (child.disabled) {
                return (
                  <div
                    key={child.href}
                    className="flex justify-between items-center rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground/50 cursor-not-allowed"
                    title="Dalam Pengembangan"
                  >
                    <div className="flex items-center gap-2">
                      <child.icon className="h-3.5 w-3.5" />
                      {child.label}
                    </div>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-muted-foreground/30 text-muted-foreground/60">Dev</Badge>
                  </div>
                );
              }
              
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    pathname === child.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <child.icon className="h-3.5 w-3.5" />
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // @ts-expect-error - checking if top-level item is disabled just in case
  if (item.disabled) {
    return (
      <div
        className={cn(
          "flex justify-between items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed",
          collapsed && "justify-center px-2",
        )}
        title="Dalam Pengembangan"
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </div>
        {!collapsed && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-muted-foreground/30 text-muted-foreground/60">Dev</Badge>}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive ? "sidebar-link-active text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent",
        collapsed && "justify-center px-2",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

function SidebarDesktop({ collapsed, onClose, business }: { collapsed: boolean; onClose: () => void; business: Record<string, unknown> }) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-sidebar transition-all duration-200 sticky top-0 h-dvh",
        collapsed ? "w-[64px]" : "w-[240px]",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-border px-4 gap-2",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold uppercase shrink-0">
          {business?.name?.charAt(0) || "A"}
        </div>
        {!collapsed && <span className="font-semibold text-[15px] tracking-tight truncate">{business?.name || "Attract"}</span>}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {navItems.map((item, i) => (
          <SidebarItem key={i} item={item} pathname={pathname} collapsed={collapsed} />
        ))}
      </nav>
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-9 w-full", collapsed && "justify-center")}
          onClick={onClose}
        >
          <ChevronLeft className="h-4 w-4" />
          {!collapsed && <span className="ml-2 text-xs text-muted-foreground">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}

function SidebarMobile({ open, onOpenChange, business }: { open: boolean; onOpenChange: (open: boolean) => void; business: Record<string, unknown> }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[260px] p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-14 items-center border-b border-border px-4 gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold uppercase shrink-0">
            {business?.name?.charAt(0) || "A"}
          </div>
          <span className="font-semibold text-[15px] tracking-tight truncate">{business?.name || "Attract"}</span>
        </div>
        <nav className="space-y-1 overflow-y-auto px-2 py-3">
          {navItems.map((item, i) => (
            <SidebarItem key={i} item={item} pathname="" collapsed={false} />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function AppShell({ children, user, business }: { children: React.ReactNode; user?: Record<string, unknown>; business?: Record<string, unknown> }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const hideHeaderPaths = ["/dashboard"];
  const showHeader = !hideHeaderPaths.includes(pathname);

  return (
    <div className="min-h-dvh bg-background text-foreground flex">
      <SidebarDesktop collapsed={collapsed} onClose={() => setCollapsed(true)} business={business} />
      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-3 left-3 z-40 hidden lg:flex h-8 w-8 border border-border bg-sidebar shadow-sm"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
      <SidebarMobile open={mobileOpen} onOpenChange={setMobileOpen} business={business} />
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-200"
      >
        {showHeader && (
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <div className="flex-1">
              <h1 className="text-sm font-medium text-foreground capitalize">{pathname.split("/").pop()}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">Pro Plan</Badge>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8"
                onClick={async () => {
                  const { signOut } = await import("@/lib/auth-client");
                  await signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/login";
                      },
                    },
                  });
                }}
              >
                Sign out
              </Button>
              {user?.image ? (
                <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full ring-2 ring-border object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent ring-2 ring-border text-xs font-semibold uppercase">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
          </header>
        )}
        <main className="flex-1 animate-in fade-in duration-300">{children}</main>
      </div>
    </div>
  );
}
