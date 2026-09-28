import { MemoryDrawer } from "@/components/memory/MemoryDrawer";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAppStore } from "@/store/useAppStore";

const SHORTCUT_MAP: Record<string, string> = {
  d: "/dashboard",
  i: "/incidents",
  w: "/workspace",
  m: "/memory",
  r: "/runbooks",
  p: "/postmortems",
  s: "/services",
};

function ShortcutHelp({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    ["⌘ K / Ctrl K", "Global search & commands"],
    ["G D", "Dashboard"],
    ["G I", "Active incidents"],
    ["G W", "Incident workspace"],
    ["G M", "Memory overview"],
    ["G R", "Runbooks"],
    ["G P", "Postmortems"],
    ["G S", "Service map"],
    ["?", "This help"],
  ];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-popover p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-semibold">Keyboard shortcuts</p>
        <ul className="mt-3 space-y-2">
          {rows.map(([k, label]) => (
            <li key={k} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {k}
              </kbd>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[10px] text-faint">Press Esc or click outside to close.</p>
      </div>
    </div>
  );
}

export function AppShell() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const closeMemoryDrawer = useAppStore((s) => s.closeMemoryDrawer);
  const memoryDrawerId = useAppStore((s) => s.memoryDrawerId);

  useEffect(() => {
    let lastG = 0;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (typing) return;

      if (e.key === "?") {
        setShowShortcuts((s) => !s);
        return;
      }
      if (e.key === "g" || e.key === "G") {
        lastG = Date.now();
        return;
      }
      if (Date.now() - lastG < 900) {
        const to = SHORTCUT_MAP[e.key.toLowerCase()];
        if (to) {
          e.preventDefault();
          navigate(to);
          lastG = 0;
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navigate]);

  // Close memory drawer on route change.
  useEffect(() => {
    closeMemoryDrawer();
  }, [location.pathname, closeMemoryDrawer]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav />
          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px]">
              <Outlet />
            </div>
          </main>
          <footer className="border-t border-border/60 px-6 py-3 text-center text-[11px] text-faint">
            IncidentIQ demo · all data synthetic · memory architecture:
            Frontend → Backend API → Memory Sidecar → Hindsight (retain / recall / reflect)
          </footer>
        </div>

        {memoryDrawerId && <MemoryDrawer id={memoryDrawerId} />}

        {showShortcuts && <ShortcutHelp onClose={() => setShowShortcuts(false)} />}
      </div>
    </TooltipProvider>
  );
}
