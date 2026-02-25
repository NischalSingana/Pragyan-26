"use client";

import { useDashboard } from "@/components/DashboardProvider";
import { HighRiskAlertPanel } from "@/components/HighRiskAlertPanel";

export default function AlertsPage() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-5">
        <div className="minimal-card max-w-md space-y-4 p-5">
          <p className="font-medium text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-border bg-card px-5 py-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold text-foreground">Alerts</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">High-risk patients · Re-routed when overloaded</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-5 lg:p-8">
        <div className="minimal-card p-5">
          <HighRiskAlertPanel patients={data?.highRiskPatients ?? []} />
        </div>
      </div>
    </>
  );
}
