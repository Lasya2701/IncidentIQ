import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/ui-kit/Misc";
import { KeyRound, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [notifyOn, setNotifyOn] = useState(true);
  const [autoDiagnosis, setAutoDiagnosis] = useState(true);
  const [negativeMemory, setNegativeMemory] = useState(true);
  const [model, setModel] = useState("gpt-4.1");
  const [temperature, setTemperature] = useState("0.2");
  const [style, setStyle] = useState("concise-technical");

  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        description="Workspace configuration. Values shown are synthetic demo defaults."
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => toast.success("Settings saved (demo)", { description: "Nothing is persisted in this demo." })}
          >
            <Save className="size-4" /> Save changes
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <p className="text-sm font-semibold">General</p>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">Timezone</Label>
              <Select defaultValue="utc">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="ist">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="pst">America/Los_Angeles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">Theme</Label>
              <Select defaultValue="dark">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark command center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm">Incident notifications</span>
              <Switch checked={notifyOn} onCheckedChange={setNotifyOn} aria-label="Toggle incident notifications" />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <p className="text-sm font-semibold">AI</p>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4.1">gpt-4.1 (demo)</SelectItem>
                  <SelectItem value="gpt-4.1-mini">gpt-4.1-mini (demo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">Temperature</Label>
              <Select value={temperature} onValueChange={setTemperature}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["0", "0.2", "0.4", "0.7"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">Response style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise-technical">Concise technical</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm">Auto-run diagnosis on new criticals</span>
              <Switch checked={autoDiagnosis} onCheckedChange={setAutoDiagnosis} aria-label="Toggle auto diagnosis" />
            </label>
          </CardContent>
        </Card>

        <Card className="border-memory/25">
          <CardHeader className="pb-0">
            <p className="text-sm font-semibold">Memory</p>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">Memory retention</Label>
              <Select defaultValue="forever">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="forever">Keep forever</SelectItem>
                  <SelectItem value="2y">2 years</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">Retrieval depth</Label>
              <Select defaultValue="balanced">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast (top 3)</SelectItem>
                  <SelectItem value="balanced">Balanced (top 5)</SelectItem>
                  <SelectItem value="deep">Deep (top 10)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-border px-3 py-2.5 text-xs text-muted-foreground">
              Memory sources: Hindsight · gbrain · PostgreSQL · Postmortems · Runbooks
            </div>
            <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm">
                Retain negative memory
                <span className="block text-[11px] text-faint">Keep "tried and didn't help" records</span>
              </span>
              <Switch checked={negativeMemory} onCheckedChange={setNegativeMemory} aria-label="Toggle negative memory" />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <p className="text-sm font-semibold">Security</p>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5">
              <KeyRound className="size-4 text-faint" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">Hindsight API key</p>
                <p className="font-mono text-[11px] text-muted-foreground">••••••••••••••••</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => toast("Key rotation is disabled in the demo")}
              >
                Rotate
              </Button>
            </div>
            <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm">
                Require re-auth for memory exports
                <span className="block text-[11px] text-faint">Sessions expire after 12h idle</span>
              </span>
              <Switch defaultChecked aria-label="Toggle export re-auth" />
            </label>
            <p className="text-[11px] text-faint">
              Access control: role-based (on-call, SRE admin, viewer) — demo stub.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
