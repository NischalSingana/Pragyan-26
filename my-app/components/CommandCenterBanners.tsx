"use client";

/**
 * Phase 7 — Surge indicator, bias warning, AI disagreement alerts.
 */

type Props = {
  surgeMode?: boolean;
  aiDisagreementCount?: number;
};

export function CommandCenterBanners({
  surgeMode,
  aiDisagreementCount = 0,
}: Props) {
  const showSurge = surgeMode === true;
  const showDisagreement = aiDisagreementCount > 0;

  if (!showSurge && !showDisagreement) return null;

  return (
    <div className="space-y-2">
      {showSurge && (
        <div className="rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-800">
          <span className="font-medium">Surge mode active</span>
          <span className="ml-2 opacity-90">
            — Higher priority for high-risk cases · Aggressive re-routing
          </span>
        </div>
      )}
      {showDisagreement && (
        <div className="rounded-md border border-primary/50 bg-primary/10 px-4 py-2.5 text-sm text-primary">
          <span className="font-medium">AI disagreement alerts</span>
          <span className="ml-2 opacity-90">
            — {aiDisagreementCount} patient(s) with model disagreement (review recommended).
          </span>
        </div>
      )}
    </div>
  );
}
