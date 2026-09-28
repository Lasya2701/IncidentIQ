import { MemoryAtWorkStrip, LearningLoop } from "@/components/memory/LearningLoop";
import { WithVsWithoutMemory } from "@/components/memory/WithVsWithoutMemory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DemoBadge } from "@/components/ui-kit/Status";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CircleX,
  Network,
  ScrollText,
  Siren,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Hindsight memory",
    body: "Every incident, root cause, fix and failure is retained — then recalled the moment a similar incident appears.",
    tint: "text-memory",
    ring: "border-memory/30",
  },
  {
    icon: Sparkles,
    title: "Context-aware AI diagnosis",
    body: "The AI compares the live incident against historical resolutions and cites exactly which memories shaped its recommendation.",
    tint: "text-ai",
    ring: "border-ai/30",
  },
  {
    icon: CircleX,
    title: "Knows what didn't work",
    body: "Negative memories record failed fixes so on-call engineers never repeat them at 3am.",
    tint: "text-critical",
    ring: "border-critical/25",
  },
  {
    icon: BookOpen,
    title: "Runbook effectiveness",
    body: "Each runbook carries its real track record: \"Resolved 5 of 6 incidents\" — with per-incident outcomes.",
    tint: "text-info",
    ring: "border-info/25",
  },
  {
    icon: ScrollText,
    title: "Live logs & timeline",
    body: "Streaming logs, animated investigation timeline and every AI step expandable for audit.",
    tint: "text-warning",
    ring: "border-warning/25",
  },
  {
    icon: Network,
    title: "Service knowledge graph",
    body: "Incidents link to services, runbooks, postmortems and each other in one explorable graph.",
    tint: "text-success",
    ring: "border-success/25",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-ai to-memory text-white shadow-sm">
            <BrainCircuit className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold tracking-tight">IncidentIQ</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-faint">
              AI Operations
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">Open app</Link>
          </Button>
          <Button asChild size="sm" className="bg-memory text-white hover:bg-memory/90">
            <Link to="/workspace">
              Launch live workspace <ArrowRight className="size-4" />
            </Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 text-center">
        <div className="mx-auto flex max-w-fit items-center gap-2">
          <DemoBadge />
          <Badge variant="outline" className="border-memory/30 bg-memory/10 text-memory">
            <Siren className="size-3" /> Incident response agent
          </Badge>
        </div>
        <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          AI incident response that{" "}
          <span className="bg-gradient-to-r from-ai to-memory bg-clip-text text-transparent">
            remembers
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
          The first time it sees an incident, it investigates. The next time, it
          remembers. IncidentIQ pairs an SRE command center with persistent Hindsight
          memory of every root cause, resolution and dead end.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-memory text-white hover:bg-memory/90">
            <Link to="/workspace">
              Open the incident workspace <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-border bg-card">
            <Link to="/memory">Explore the memory</Link>
          </Button>
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-xl border border-memory/25 bg-gradient-to-b from-memory/[0.07] to-transparent p-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-memory">
            Incident → Memory → Learning → Better response
          </p>
          <LearningLoop variant="hero" className="mt-5" />
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          What changes when IncidentIQ remembers?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
          The same incident, with and without historical context.
        </p>
        <WithVsWithoutMemory className="mt-8" />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className={`border ${f.ring} bg-card`}>
              <CardContent className="p-5">
                <f.icon className={`size-5 ${f.tint}`} />
                <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <MemoryAtWorkStrip className="justify-center" />
          <h2 className="mt-6 text-xl font-bold tracking-tight">
            Start from a live incident
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            The workspace opens on a critical payment incident with 4 historical
            matches already waiting in memory.
          </p>
          <Button asChild size="lg" className="mt-5 bg-memory text-white hover:bg-memory/90">
            <Link to="/workspace">
              Launch workspace <ArrowRight className="size-4" />
            </Link>
          </Button>
          <p className="mt-4 text-[11px] text-faint">
            All data in this demo is synthetic. Demo relevance scores are illustrative,
            not validated accuracy claims.
          </p>
        </div>
      </section>
    </div>
  );
}
