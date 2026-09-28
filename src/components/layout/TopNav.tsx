import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  Check,
  CircleCheck,
  CircleHelp,
  Search,
  Server,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { timeAgo, titleCase } from "@/utils/format";
import { DemoBadge } from "@/components/ui-kit/Status";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { openCommandPalette } from "@/components/layout/commandPaletteBus";

const NOTIF_ICON = {
  critical: TriangleAlert,
  memory: Sparkles,
  system: Server,
  ai: CircleCheck,
} as const;

function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);
  const crumbs = parts.length
    ? parts.map((p, i) => ({
        label: titleCase(decodeURIComponent(p)),
        to: `/${parts.slice(0, i + 1).join("/")}`,
      }))
    : [{ label: "IncidentIQ", to: "/" }];

  return (
    <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-xs text-faint md:flex">
      {crumbs.map((c, i) => (
        <span key={c.to} className="flex items-center gap-1">
          {i > 0 && <span className="text-border">/</span>}
          {i === crumbs.length - 1 ? (
            <span className="max-w-40 truncate font-medium text-muted-foreground">{c.label}</span>
          ) : (
            <Link to={c.to} className="max-w-32 truncate hover:text-foreground">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function NotificationsPanel() {
  const { notifications, markRead, markAllRead, clearAll } = useAppStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
          className="relative flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-critical text-[9px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 bg-popover p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 text-xs">
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-muted-foreground">
              Clear
            </Button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              You're all caught up.
            </p>
          )}
          {notifications.map((n) => {
            const Icon = NOTIF_ICON[n.kind];
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                  !n.read && "bg-memory/5",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border",
                    n.kind === "critical" && "border-critical/30 bg-critical/10 text-critical",
                    n.kind === "memory" && "border-memory/30 bg-memory/10 text-memory",
                    n.kind === "system" && "border-info/30 bg-info/10 text-info",
                    n.kind === "ai" && "border-ai/30 bg-ai/10 text-ai",
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={cn("truncate text-[13px] font-medium", !n.read && "text-foreground")}>
                      {n.title}
                    </span>
                    {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-memory" />}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{n.body}</span>
                  <span className="mt-1 block text-[10px] text-faint">{timeAgo(n.createdAt)}</span>
                </span>
                {n.read && <Check className="mt-1 size-3 shrink-0 text-faint" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TopNav() {
  const { environment, setEnvironment, userName } = useAppStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Breadcrumbs />

      {/* Global search trigger */}
      <button
        type="button"
        onClick={openCommandPalette}
        className="group ml-auto flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-memory/40 hover:text-foreground"
      >
        <Search className="size-4 text-faint" />
        <span className="flex-1 truncate text-left text-[13px]">
          Search incidents, services, memories…
        </span>
        <Kbd className="border-border bg-secondary text-[10px] text-muted-foreground">⌘ K</Kbd>
      </button>

      <div className="flex items-center gap-1.5">
        <DemoBadge className="hidden xl:inline-flex" />

        {/* Environment selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-border bg-card text-xs">
              <span className="size-1.5 rounded-full bg-success" />
              {environment}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs text-faint">Environment</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={environment}
              onValueChange={(v) => setEnvironment(v as typeof environment)}
            >
              {(["Production", "Staging", "Development"] as const).map((env) => (
                <DropdownMenuRadioItem key={env} value={env} className="text-xs">
                  <span
                    className={cn(
                      "mr-2 inline-block size-1.5 rounded-full",
                      env === "Production" ? "bg-success" : "bg-faint",
                    )}
                  />
                  {env}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <span
          className="hidden items-center gap-1.5 rounded-md border border-success/25 bg-success/10 px-2 py-1 text-[11px] font-medium text-success sm:inline-flex"
          title="All IncidentIQ system components connected"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-success" />
          </span>
          Operational
        </span>

        <NotificationsPanel />

        <button
          type="button"
          aria-label="Help"
          className="hidden size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
        >
          <CircleHelp className="size-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="User menu"
              className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-ai to-memory text-[11px] font-bold text-white"
            >
              {userName.slice(0, 2).toUpperCase()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs">
              {userName} · on-call
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="text-xs">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/" className="text-xs">Landing</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandPalette />
    </header>
  );
}
