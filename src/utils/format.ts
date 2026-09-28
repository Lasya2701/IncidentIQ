/** Formatting helpers used across the app. */

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/** 1482 -> "1.5k" / 12400 -> "12.4k" — compact metric labels. */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

/** 526 seconds -> "8m 46s" */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

/** Minutes -> "18m 42s" style. */
export function formatMinutes(minutes: number): string {
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  return `${m}m ${s}s`;
}

/** Minutes -> "11 min". */
export function formatMinutesShort(minutes: number): string {
  return `${Math.round(minutes)} min`;
}

/** HH:MM:SS clock string, demo-friendly. */
export function clockNow(base?: Date): string {
  const d = base ?? new Date();
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** "June 18, 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** "Jun 18" */
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** "14:32" from "14:32:08" or ISO. */
export function shortTime(timeStr: string): string {
  const parts = timeStr.split(":");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  const d = new Date(timeStr);
  if (!Number.isNaN(d.getTime())) {
    const pad = (v: number) => String(v).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return timeStr;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function titleCase(s: string): string {
  return s
    .split(/[\s_]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Simple debounce for search inputs. */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): (...args: A) => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), waitMs);
  };
}
