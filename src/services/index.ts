import { HindsightHttpProvider } from "@/services/http";
import { MockMemoryProvider } from "@/services/mock";
import type { MemoryProvider, ProviderMode } from "@/services/provider";

/**
 * Provider selection.
 *
 * - `VITE_USE_MOCK=true` (or unset backend URL) → MockMemoryProvider
 * - `VITE_USE_MOCK=false` + `VITE_IIQ_API_URL` set → HindsightHttpProvider
 *   (currently a stub; falls back to mock until the backend is live)
 */
function selectProvider(): { provider: MemoryProvider; mode: ProviderMode } {
  const raw = (import.meta.env.VITE_USE_MOCK as string | undefined) ?? "true";
  const useMock = raw !== "false";
  if (!useMock && import.meta.env.VITE_IIQ_API_URL) {
    return {
      provider: new HindsightHttpProvider(),
      mode: "http",
    };
  }
  return { provider: new MockMemoryProvider(), mode: "mock" };
}

export const { provider: api, mode: providerMode } = selectProvider();
export type { MemoryProvider } from "@/services/provider";
