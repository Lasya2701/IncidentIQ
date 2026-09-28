import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AppShell = lazy(() => import("./components/layout/AppShell.tsx").then((m) => ({ default: m.AppShell })));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Workspace = lazy(() => import("./pages/Workspace.tsx"));
const IncidentsPage = lazy(() => import("./pages/Incidents.tsx"));
const DiagnosisPage = lazy(() => import("./pages/Diagnosis.tsx"));
const TimelinePage = lazy(() => import("./pages/TimelinePage.tsx"));
const MemoryPage = lazy(() => import("./pages/Memory.tsx"));
const MemorySearchPage = lazy(() => import("./pages/MemorySearch.tsx"));
const SimilarIncidentsPage = lazy(() => import("./pages/SimilarIncidents.tsx"));
const GraphPage = lazy(() => import("./pages/Graph.tsx"));
const RunbooksPage = lazy(() => import("./pages/Runbooks.tsx"));
const PostmortemsPage = lazy(() => import("./pages/Postmortems.tsx"));
const ServiceKnowledgePage = lazy(() => import("./pages/ServiceKnowledge.tsx"));
const ServicesPage = lazy(() => import("./pages/Services.tsx"));
const HistoryPage = lazy(() => import("./pages/History.tsx"));
const AnalyticsPage = lazy(() => import("./pages/Analytics.tsx"));
const SystemHealthPage = lazy(() => import("./pages/SystemHealth.tsx"));
const IntegrationsPage = lazy(() => import("./pages/Integrations.tsx"));
const SettingsPage = lazy(() => import("./pages/Settings.tsx"));
const DeploymentsPage = lazy(() => import("./pages/Deployments.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="animate-pulse text-sm text-muted-foreground">Loading…</div>
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in the browser runtime). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[Preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 break-words text-xs text-muted-foreground">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 max-h-40 overflow-auto rounded border border-border/60 p-2 text-left text-[10px] leading-4 text-muted-foreground/80">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  React.useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  React.useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbarLazy />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/workspace" element={<Workspace />} />
                <Route path="/incidents" element={<IncidentsPage />} />
                <Route path="/diagnosis" element={<DiagnosisPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/memory" element={<MemoryPage />} />
                <Route path="/memory/search" element={<MemorySearchPage />} />
                <Route path="/memory/similar" element={<SimilarIncidentsPage />} />
                <Route path="/memory/graph" element={<GraphPage />} />
                <Route path="/runbooks" element={<RunbooksPage />} />
                <Route path="/postmortems" element={<PostmortemsPage />} />
                <Route path="/knowledge" element={<ServiceKnowledgePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/deployments" element={<DeploymentsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/analytics" element={<AnalyticsPage tab="incidents" />} />
                <Route path="/analytics/incidents" element={<AnalyticsPage tab="incidents" />} />
                <Route path="/analytics/resolution" element={<AnalyticsPage tab="resolution" />} />
                <Route path="/analytics/memory" element={<AnalyticsPage tab="memory" />} />
                <Route path="/system" element={<SystemHealthPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="bottom-right" />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);

// The toolbar is injected read-only by the platform; dynamic import keeps it
// out of the main bundle. Kept as a lazy component to mirror template behavior.
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
function VlyToolbarLazy() {
  return <VlyToolbar />;
}
