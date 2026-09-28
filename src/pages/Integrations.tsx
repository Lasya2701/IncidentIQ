import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-kit/Misc";
import { StatDot } from "@/components/ui-kit/Status";
import { integrations } from "@/data/system";
import { Check, KeyRound, Plug, Settings2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function IntegrationsPage() {
  const [testing, setTesting] = useState<string | undefined>();

  const test = async (id: string, name: string) => {
    setTesting(id);
    await new Promise((r) => setTimeout(r, 900));
    setTesting(undefined);
    toast.success(`${name} connection healthy`, { description: "Synthetic check — demo environment." });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Integrations"
        description="Connectors between IncidentIQ and your stack. Secrets are never displayed."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map((i) => (
          <Card key={i.id} className={cn("gap-0", i.connected ? "border-border" : "border-dashed")}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Plug className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{i.name}</p>
                  <p className="text-[11px] text-faint">{i.category}</p>
                </div>
                <span
                  className={cn(
                    "ml-auto inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    i.connected
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-border bg-secondary text-muted-foreground",
                  )}
                >
                  <StatDot health={i.connected ? "healthy" : "warning"} className="scale-75" />
                  {i.connected ? "Connected" : "Not connected"}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{i.detail}</p>

              {i.connected && (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-bg-secondary px-2.5 py-1.5">
                  <KeyRound className="size-3.5 text-faint" />
                  <span className="font-mono text-xs text-muted-foreground">••••••••••••</span>
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-success">
                    <Check className="size-3" /> valid
                  </span>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => toast("Configure " + i.name, { description: "Settings panel is a demo stub." })}
                >
                  <Settings2 className="size-3.5" /> Configure
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={testing === i.id}
                  onClick={() => test(i.id, i.name)}
                >
                  {testing === i.id ? "Testing…" : "Test Connection"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
