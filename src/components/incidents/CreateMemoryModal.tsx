import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { notify, useAppStore } from "@/store/useAppStore";
import type { Incident } from "@/types/incident-iq";
import { BrainCircuit, Check, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AUTO_EXTRACT = [
  "Incident symptoms",
  "Root cause",
  "Diagnostic reasoning",
  "Resolution",
  "Outcome",
  "Preventive actions",
] as const;

export function CreateMemoryModal({
  open,
  onClose,
  incident,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  incident: Incident;
  onSaved?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [investigation, setInvestigation] = useState("");
  const [resolution, setResolution] = useState("");
  const [outcome, setOutcome] = useState("");
  const [preventive, setPreventive] = useState("");
  const [lessons, setLessons] = useState("");
  const [useRunbook, setUseRunbook] = useState(true);
  const [runbookOutcome, setRunbookOutcome] = useState<"worked" | "partial" | "failed">("worked");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const onMemoryCreated = useAppStore((s) => s.onMemoryCreated);

  // Pre-fill from incident knowledge on open
  useEffect(() => {
    if (!open) return;
    setSaved(false);
    setTitle(`${incident.title} — resolution`);
    setSymptoms("HTTP 503 on charge endpoints; pool at configured limit; DB utilization 100%");
    setRootCause("Database connection pool exhaustion");
    setInvestigation(
      "Logs showed 'Maximum pool size reached' preceding each 503; pool wait queue 47; Redis healthy so dependency failure ruled out; Hindsight matched 4 prior incidents.",
    );
    setResolution("Connection pool limit raised 50 → 100; rolling restart; 503 rate monitored to <1%.");
    setOutcome("503 rate recovered to 0% within 6 minutes of the pool increase.");
    setPreventive("Capacity review before traffic events; saturation load-test scenario; pool-limit drift guardrail.");
    setLessons("Restart-only responses fail for capacity-shaped incidents; pool limits are launch-blocking config.");
  }, [open, incident]);

  const save = async (draft: boolean) => {
    setSaving(true);
    try {
      const memory = await api.createMemory({
        incidentId: incident.id,
        title: draft ? `${title} (draft)` : title,
        service: incident.service,
        symptoms: symptoms.split(";").map((s) => s.trim()).filter(Boolean),
        rootCause,
        investigation: investigation ? [investigation] : [],
        resolution: resolution.split(";").map((s) => s.trim()).filter(Boolean),
        runbookId: useRunbook ? "rb-db-pool" : undefined,
        runbookOutcome: useRunbook ? runbookOutcome : undefined,
        outcome,
        preventiveActions: preventive.split(";").map((s) => s.trim()).filter(Boolean),
        lessons: lessons.split(";").map((s) => s.trim()).filter(Boolean),
        severity: incident.severity,
      });
      onMemoryCreated();
      notify("memory", "New memory created", `${memory.id} stored in Hindsight.`);
      toast.success("New memory successfully created", {
        description: `${memory.id} is now searchable in Memory.`,
      });
      setSaved(true);
      onSaved?.();
      setTimeout(onClose, 700);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="size-5 text-memory" /> Create Incident Memory
          </DialogTitle>
          <DialogDescription>
            Auto-extracted from {incident.id}. Edit anything before saving — this becomes
            searchable operational memory.
          </DialogDescription>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {AUTO_EXTRACT.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full border border-memory/25 bg-memory/10 px-2 py-0.5 text-[10px] font-medium text-memory"
              >
                <Check className="size-2.5" /> {f}
              </span>
            ))}
          </div>
        </DialogHeader>

        <div className="grid gap-3">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Symptoms (semicolon-separated)">
            <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={2} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Root cause">
              <Input value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
            </Field>
            <Field label="Outcome">
              <Input value={outcome} onChange={(e) => setOutcome(e.target.value)} />
            </Field>
          </div>
          <Field label="Investigation">
            <Textarea value={investigation} onChange={(e) => setInvestigation(e.target.value)} rows={2} />
          </Field>
          <Field label="Resolution (semicolon-separated steps)">
            <Textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={2} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Preventive actions">
              <Textarea value={preventive} onChange={(e) => setPreventive(e.target.value)} rows={2} />
            </Field>
            <Field label="Lessons learned">
              <Textarea value={lessons} onChange={(e) => setLessons(e.target.value)} rows={2} />
            </Field>
          </div>

          <div className="rounded-lg border border-info/25 bg-info/[0.05] p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox checked={useRunbook} onCheckedChange={() => setUseRunbook((v) => !v)} />
              Record runbook outcome (Database Connection Pool Exhaustion)
            </label>
            {useRunbook && (
              <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label="Runbook outcome">
                {(["worked", "partial", "failed"] as const).map((o) => (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={runbookOutcome === o}
                    onClick={() => setRunbookOutcome(o)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                      runbookOutcome === o
                        ? o === "worked"
                          ? "border-success/40 bg-success/10 text-success"
                          : o === "partial"
                            ? "border-warning/40 bg-warning/10 text-warning"
                            : "border-critical/40 bg-critical/10 text-critical"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
            <p className="mt-1.5 text-[10px] text-faint">
              Recording the outcome updates this runbook's effectiveness
              (resolved 5 of 6 → 6 of 7).
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" disabled={saving} onClick={() => save(true)}>
            Save as Draft
          </Button>
          <Button
            disabled={saving || saved}
            onClick={() => save(false)}
            className="gap-1.5 bg-memory text-white hover:bg-memory/90"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Save to Hindsight
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
