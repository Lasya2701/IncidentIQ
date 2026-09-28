import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";

export function KpiCard({
  label,
  value,
  context,
  icon: Icon,
  accent = "text-muted-foreground",
  valueClass,
}: {
  label: string;
  value: string;
  context?: string;
  icon: LucideIcon;
  accent?: string;
  valueClass?: string;
}) {
  return (
    <Card className="hairline-top gap-1 rounded-lg px-4 py-3.5">
      <div className="flex items-center gap-1.5">
        <Icon className={cn("size-3.5", accent)} />
        <span className="truncate text-[11px] font-medium text-muted-foreground">{label}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              role="note"
              aria-label={`${label} is synthetic demo data`}
              className="ml-auto text-faint"
            >
              <Info className="size-3" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px]">
            Demo data — synthetic value, not a live metric
          </TooltipContent>
        </Tooltip>
      </div>
      <p className={cn("tnum text-2xl font-bold tracking-tight text-foreground", valueClass)}>
        {value}
      </p>
      {context && <p className="truncate text-[11px] text-faint">{context}</p>}
    </Card>
  );
}
