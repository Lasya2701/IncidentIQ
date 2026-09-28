import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services";
import { notify } from "@/store/useAppStore";
import type { Incident } from "@/types/incident-iq";
import { BrainCircuit, Check, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function PostmortemEditor({
  open,
  onClose,
  incident,
}: {
  open: boolean;
  onClose: () => void;
  incident: Incident;
}) {
  const [title, setTitle] = useState("");
  const [impact, setImpact] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [resolution, setResolution] = useState("");
  const [factors, setFactors] = useState("");
  const [actions, setActions] = useState("");
  const [lessons, setLessons] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDone(false);
    setTitle(`${incident.title} — Postmortem`);
    setImpact(`~${(incident.affectedUsers ?? 0).toLocaleString()} users impacted during the incident window.`);
    setRootCause("Database connection pool exhaustion under launch-level traffic.");
    setResolution("Pool limit raised 50 → 100 with rolling restart; recovery confirmed via 503 rate.");
    setFactors("Pool sized for pre-launch traffic; no saturation load test; restart-only response attempted first.");
    setActions("Capacity review gate; saturation scenario in load tests; pool-limit drift guardrail.");
    setLessons("Capacity-shaped incidents need capacity fixes; failed attempts are memory too.");
  }, [open, incident]);

  const save = async () => {
    setSaving(true);
    try {
      await api.createPostmortem({
        incidentId: incident.id,
        title,
        impact,
        rootCause,
        timeline: (incident.timelineKey ? [] : []).concat([
          { time: "14:32:08", event: "Incident detected" },
          { time: "14:32:28", event: "Hindsight search initiated" },
          { time: "14:33:10", event: "Remediation applied" },
          { time: "14:36:00", event: "Incident resolved" },
        ]),
        resolution,
        contributingFactors: factors.split(";").map((s) => s.trim()).filter(Boolean),
        preventiveActions: actions.split(";").map((s) => s.trim()).filter(Boolean),
        lessonsLearned: lessons.split(";").map((s) => s.trim()).filter(Boolean),
      });
      notify("memory", "Postmortem added to memory", `Lessons from ${incident.id} stored in Hindsight.`);
      setDone(true);
      toast.success("Added to Hindsight Memory ✓", {
        description: "Lessons learned were extracted into a new searchable memory.",
      });
      setTimeout(onClose, 900);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-success" /> Create Postmortem — {incident.id}
          </DialogTitle>
          <DialogDescription>
            Saving extracts lessons learned into Hindsight as new memory — this is how
            IncidentIQ learns from postmortems.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Impact</Label>
            <Textarea value={impact} onChange={(e) => setImpact(e.target.value)} rows={2} className="mt-1" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Root cause</Label>
              <Input value={rootCause} onChange={(e) => setRootCause(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Resolution</Label>
              <Input value={resolution} onChange={(e) => setResolution(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Contributing factors (semicolon-separated)</Label>
            <Textarea value={factors} onChange={(e) => setFactors(e.target.value)} rows={2} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Preventive actions (semicolon-separated)</Label>
            <Textarea value={actions} onChange={(e) => setActions(e.target.value)} rows={2} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Lessons learned (semicolon-separated)</Label>
            <Textarea value={lessons} onChange={(e) => setLessons(e.target.value)} rows={2} className="mt-1" />
          </div>
        </div>

        <DialogFooter className="items-center">
          {done && (
            <span className="mr-auto inline-flex items-center gap-1.5 text-xs font-medium text-success">
              <Check className="size-4" /> Added to Hindsight Memory ✓
            </span>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={saving || done}
            onClick={save}
            className="gap-1.5 bg-memory text-white hover:bg-memory/90"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <BrainCircuit className="size-4" />
            )}
            Save & Extract Lessons
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
