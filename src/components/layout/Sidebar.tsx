import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  BrainCircuit,
  ChevronLeft,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Network,
  Settings,
  Siren,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DemoBadge } from "@/components/ui-kit/Status";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  hint?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { label: "Workspace", to: "/workspace", icon: Siren, hint: "Incident command center" },
      { label: "Active Incidents", to: "/incidents", icon: Bell },
      { label: "AI Diagnosis", to: "/diagnosis", icon: Bot },
      { label: "Incident Timeline", to: "/timeline", icon: Activity },
      { label: "Service Map", to: "/services", icon: Network },
    ],
  },
  {
    label: "Memory",
    items: [
      { label: "Memory Overview", to: "/memory", icon: BrainCircuit },
      { label: "Memory Search", to: "/memory/search", icon: BookOpen },
      { label: "Similar Incidents", to: "/memory/similar", icon: Workflow },
      { label: "Knowledge Graph", to: "/memory/graph", icon: Network },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { label: "Runbooks", to: "/runbooks", icon: BookOpen },
      { label: "Postmortems", to: "/postmortems", icon: FileText },
      { label: "Service Knowledge", to: "/knowledge", icon: BrainCircuit },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Incident Analytics", to: "/analytics/incidents", icon: BarChart3 },
      { label: "Resolution Analytics", to: "/analytics/resolution", icon: BarChart3 },
      { label: "Memory Analytics", to: "/analytics/memory", icon: BrainCircuit },
    },
  },
  {
    label: "System",
    items: [
      { label: "System Health", to: "/system", icon: Activity },
      { label: "Integrations", to: "/integrations", icon: Workflow },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

function NavLinks({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3" aria-label="Primary">
      {NAV.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-faint">
              {group.label}
            </div>
          )}
          {collapsed && <div className="mx-2 mb-2 border-t border-border/60" />}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to !== "/dashboard" && location.pathname.startsWith(`${item.to}/`)) ||
                (item.to === "/memory" && location.pathname.startsWith("/memory"));
              const link = (
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors duration-150",
                    active
                      ? "bg-memory/12 text-foreground ring-1 ring-inset ring-memory/25"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <item.icon
                    className={cn("size-4 shrink-0", active ? "text-memory" : "text-faint")}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
              return (
                <li key={item.to}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="border-t border-border/60 p-3">
      {!collapsed && (
        <>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <LifeBuoy className="size-3.5 text-faint" />
            <Link to="/settings" className="hover:text-foreground">
              Help
            </Link>
            <span className="text-faint">·</span>
            <Link to="/system" className="hover:text-foreground">
              Documentation
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <DemoBadge />
            <span className="text-[10px] text-faint">v1.0.0-demo</span>
          </div>
        </>
      )}
      {collapsed && (
        <div className="flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/settings"
                className="flex size-7 items-center justify-center rounded-md text-faint hover:bg-secondary hover:text-foreground"
              >
                <CircleHelp className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Help & docs</TooltipContent>
          </Tooltip>
          <DemoBadge className="scale-90" />
        </div>
      )}
    </div>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-ai to-memory text-white shadow-sm">
        <BrainCircuit className="size-4.5" />
      </span>
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold leading-tight tracking-tight text-foreground">
            IncidentIQ
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-widest text-faint">
            AI Operations
          </span>
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside
        data-collapsed={collapsed}
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border/70 bg-bg-secondary transition-[width] duration-200 ease-out lg:flex",
          collapsed ? "w-[60px]" : "w-60",
        )}
      >
        <Brand collapsed={collapsed} />
        <NavLinks collapsed={collapsed} />
        <SidebarFooter collapsed={collapsed} />
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-16 z-10 hidden size-6 items-center justify-center rounded-full border border-border bg-card-elevated text-faint shadow-sm transition-colors hover:text-foreground lg:flex"
        >
          <ChevronLeft
            className={cn("size-3.5 transition-transform duration-200", collapsed && "rotate-180")}
          />
        </button>
      </aside>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open navigation"
            className="fixed bottom-4 left-4 z-40 flex size-11 items-center justify-center rounded-full border border-border bg-card-elevated text-foreground shadow-lg lg:hidden"
          >
            <LayoutDashboard className="size-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-bg-secondary p-0 sm:max-w-72">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <Brand collapsed={false} />
            <NavLinks collapsed={false} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter collapsed={false} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
