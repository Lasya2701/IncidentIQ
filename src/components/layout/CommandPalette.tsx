import {
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  FileText,
  Film,
  LayoutDashboard,
  Network,
  Play,
  Settings,
  Siren,
  Workflow,
  Activity,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { registerPaletteOpener } from "@/components/layout/commandPaletteBus";
import { api } from "@/services";
import type {
  Deployment,
  Incident,
  MemoryRecord,
  Postmortem,
  Runbook,
  ServiceNode,
} from "@/types/incident-iq";
import { formatDateShort } from "@/utils/format";

interface SearchBundle {
  incidents: Incident[];
  memories: MemoryRecord[];
  runbooks: Runbook[];
  postmortems: Postmortem[];
  services: ServiceNode[];
  deployments: Deployment[];
}

const EMPTY_BUNDLE: SearchBundle = {
  incidents: [],
  memories: [],
  runbooks: [],
  postmortems: [],
  services: [],
  deployments: [],
};

const NAV_COMMANDS = [
  { label: "Go to Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Open Active Incidents", to: "/incidents", icon: Siren },
  { label: "Open Incident Workspace", to: "/workspace", icon: Siren },
  { label: "Open AI Diagnosis", to: "/diagnosis", icon: Bot },
  { label: "Search Memory", to: "/memory/search", icon: BrainCircuit },
  { label: "Open Memory Overview", to: "/memory", icon: BrainCircuit },
  { label: "Search Runbooks", to: "/runbooks", icon: BookOpen },
  { label: "Search Postmortems", to: "/postmortems", icon: FileText },
  { label: "Open Service Map", to: "/services", icon: Network },
  { label: "Open Analytics", to: "/analytics/incidents", icon: BarChart3 },
  { label: "Open System Health", to: "/system", icon: Activity },
  { label: "Open Settings", to: "/settings", icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bundle, setBundle] = useState<SearchBundle>(EMPTY_BUNDLE);
  const navigate = useNavigate();

  useEffect(() => {
    registerPaletteOpener(() => setOpen(true));
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const [incidents, memories, runbooks, postmortems, services, deployments] =
        await Promise.all([
          api.getIncidents(),
          api.searchMemory(" "),
          api.getRunbooks(),
          api.getPostmortems(),
          api.getServices(),
          api.getDeployments(),
        ]);
      if (!cancelled) {
        setBundle({ incidents, memories, runbooks, postmortems, services, deployments });
      }
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo<SearchBundle>(() => {
    if (!q) return bundle;
    const match = (s: string) => s.toLowerCase().includes(q);
    return {
      incidents: bundle.incidents.filter((i) => match(`${i.id} ${i.title} ${i.service}`)),
      memories: bundle.memories.filter((m) =>
        match(`${m.title} ${m.rootCause} ${m.service} ${m.incidentRef ?? ""}`),
      ),
      runbooks: bundle.runbooks.filter((r) => match(`${r.title} ${r.category}`)),
      postmortems: bundle.postmortems.filter((p) => match(`${p.title} ${p.rootCause}`)),
      services: bundle.services.filter((s) => match(s.name)),
      deployments: bundle.deployments.filter((d) => match(`${d.version} ${d.service}`)),
    };
  }, [bundle, q]);

  const go = (to: string) => {
    setOpen(false);
    setQuery("");
    navigate(to);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="IncidentIQ command palette"
      description="Search incidents, memories, runbooks, services…"
      className="sm:max-w-xl"
    >
      <CommandInput
        placeholder="Search incidents, services, memories…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go("/workspace?demo=1")}>
            <Play className="text-memory" />
            Launch Demo
            <span className="ml-auto text-xs text-faint">60s scripted run</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/diagnosis")}>
            <Film className="text-ai" />
            Open AI Diagnosis
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Navigate">
          {NAV_COMMANDS.map((c) => (
            <CommandItem key={c.to + c.label} onSelect={() => go(c.to)}>
              <c.icon />
              {c.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        {filtered.incidents.length > 0 && (
          <CommandGroup heading="Incidents">
            {filtered.incidents.slice(0, 6).map((i) => (
              <CommandItem key={i.id} value={`incident-${i.id}`} onSelect={() => go(`/workspace?incident=${i.id}`)}>
                <Siren className="text-critical" />
                <span className="font-mono text-xs">{i.id}</span>
                <span className="truncate text-muted-foreground">{i.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filtered.memories.length > 0 && (
          <CommandGroup heading="Memories">
            {filtered.memories.slice(0, 6).map((m) => (
              <CommandItem key={m.id} value={`memory-${m.id}`} onSelect={() => go(`/memory?focus=${m.id}`)}>
                <BrainCircuit className="text-memory" />
                <span className="font-mono text-xs">{m.id}</span>
                <span className="truncate text-muted-foreground">{m.title}</span>
                {m.incidentRef && (
                  <span className="ml-auto font-mono text-[10px] text-faint">{m.incidentRef}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filtered.runbooks.length > 0 && (
          <CommandGroup heading="Runbooks">
            {filtered.runbooks.slice(0, 5).map((r) => (
              <CommandItem key={r.id} value={`runbook-${r.id}`} onSelect={() => go(`/runbooks?focus=${r.id}`)}>
                <BookOpen className="text-info" />
                <span className="truncate">{r.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filtered.postmortems.length > 0 && (
          <CommandGroup heading="Postmortems">
            {filtered.postmortems.slice(0, 5).map((p) => (
              <CommandItem key={p.id} value={`pm-${p.id}`} onSelect={() => go(`/postmortems?focus=${p.id}`)}>
                <FileText className="text-success" />
                <span className="truncate">{p.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filtered.services.length > 0 && (
          <CommandGroup heading="Services">
            {filtered.services.slice(0, 5).map((s) => (
              <CommandItem key={s.id} value={`service-${s.id}`} onSelect={() => go(`/services?focus=${s.id}`)}>
                <Network className="text-info" />
                <span className="truncate">{s.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filtered.deployments.length > 0 && (
          <CommandGroup heading="Deployments">
            {filtered.deployments.slice(0, 4).map((d) => (
              <CommandItem key={d.id} value={`deploy-${d.id}`} onSelect={() => go("/deployments")}>
                <Workflow className="text-warning" />
                <span className="font-mono text-xs">{d.version}</span>
                <span className="truncate text-muted-foreground">{d.service}</span>
                <span className="ml-auto text-[10px] text-faint">{formatDateShort(d.deployedAt)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
