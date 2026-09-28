import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/types/incident-iq";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bell,
  BrainCircuit,
  CircleCheck,
  FileText,
  GitCommitHorizontal,
  Hand,
  ScrollText,
  Search,
  Stethoscope,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const KIND_ICON: Record<TimelineEvent["kind"], LucideIcon> = {
  detected: Bell,
  log: ScrollText,
  analysis: Activity,
  memory_search: Search,
  memory_found: BrainCircuit,
  diagnosis: Stethoscope,
  remediation: Wrench,
  resolution: CircleCheck,
  memory_created: BrainCircuit,
  postmortem: FileText,
  deployment: GitCommitHorizontal,
  ack: Hand,
};

const KIND_COLOR: Record<TimelineEvent["kind"], string> = {
  detected: "border-critical/40 bg-critical/10 text-critical",
  log: "border-border bg-secondary text-muted-foreground",
  analysis: "border-info/30 bg-info/10 text-info",
  memory_search: "border-memory/40 bg-memory/10 text-memory",
  memory_found: "border-memory/40 bg-memory/15 text-memory",
  diagnosis: "border-ai/40 bg-ai/10 text-ai",
  remediation: "border-warning/30 bg-warning/10 text-warning",
  resolution: "border-success/40 bg-success/10 text-success",
  memory_created: "border-memory/40 bg-memory/15 text-memory",
  postmortem: "border-success/30 bg-success/10 text-success",
  deployment: "border-warning/30 bg-warning/10 text-warning",
  ack: "border-info/30 bg-info/10 text-info",
};

export function IncidentTimeline({
  events,
  className,
}: {
  events: TimelineEvent[];
  className?: string;
}) {
  return (
    <ol className={cn("relative space-y-0", className)} aria-label="Incident timeline">
      {events.map((e, i) => {
        const Icon = KIND_ICON[e.kind];
        const isMemory = e.kind === "memory_search" || e.kind === "memory_found" || e.kind === "memory_created";
        return (
          <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
            {/* connector */}
            {i < events.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px",
                  isMemory ? "bg-memory/30" : "bg-border",
                )}
              />
            )}
            <AnimatePresence>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut", delay: Math.min(i * 0.05, 0.4) }}
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
                  KIND_COLOR[e.kind],
                )}
              >
                <Icon className="size-3.5" />
              </motion.span>
            </AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, ease: "easeOut", delay: Math.min(i * 0.05, 0.4) }}
              className="min-w-0 flex-1 pt-0.5"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-[11px] text-faint">{e.time}</span>
                <span
                  className={cn(
                    "text-[13px] font-semibold",
                    isMemory ? "text-memory" : "text-foreground",
                  )}
                >
                  {e.title}
                </span>
              </div>
              {e.detail && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{e.detail}</p>
              )}
            </motion.div>
          </li>
        );
      })}
    </ol>
  );
}

export function appendTimelineEvent(
  events: TimelineEvent[],
  event: Omit<TimelineEvent, "id">,
): TimelineEvent[] {
  return [...events, { ...event, id: `live-${events.length + 1}-${event.kind}` }];
}
