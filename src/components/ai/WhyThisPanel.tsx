import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FlowDiagram } from "@/components/ui-kit/Misc";
import { BrainCircuit, BookOpen, FileText, ScrollText, Activity } from "lucide-react";

const BASED_ON = [
  { icon: BrainCircuit, label: "4 historical incidents", tint: "text-memory" },
  { icon: BookOpen, label: "2 runbooks", tint: "text-info" },
  { icon: FileText, label: "1 postmortem", tint: "text-success" },
  { icon: ScrollText, label: "Current logs", tint: "text-muted-foreground" },
  { icon: Activity, label: "Current service health", tint: "text-warning" },
];

export function WhyThisPanel({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-0">
        <p className="text-sm font-semibold text-foreground">
          Why IncidentIQ recommends this
        </p>
        <p className="text-xs text-muted-foreground">
          No unexplained AI conclusions — every diagnosis shows what it was based on.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="flex flex-wrap gap-2">
          {BASED_ON.map((b) => (
            <li
              key={b.label}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-2.5 py-1.5 text-xs text-muted-foreground"
            >
              <b.icon className={`size-3.5 ${b.tint}`} />
              {b.label}
            </li>
          ))}
        </ul>
        <FlowDiagram
          steps={["Current incident", "Hindsight", "Relevant memories", "AI diagnosis"]}
          className="text-[10px]"
        />
      </CardContent>
    </Card>
  );
}
