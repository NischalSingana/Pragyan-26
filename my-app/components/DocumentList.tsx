"use client";

import { useEffect, useState } from "react";
import { DocumentViewer } from "@/components/DocumentViewer";
import type { EhrStructuredData } from "@/lib/ai/ehrTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function AiAnalysisBlock({ data }: { data: EhrStructuredData }) {
  const symptoms = data.symptoms?.map((s) => s.value).filter(Boolean) ?? [];
  const conditions = data.conditions?.map((c) => c.value).filter(Boolean) ?? [];
  const medications = data.medications?.map((m) => m.value).filter(Boolean) ?? [];
  const vitals = data.vitals ?? {};
  const hasVitals = Object.keys(vitals).length > 0;
  const hasAny = symptoms.length > 0 || conditions.length > 0 || medications.length > 0 || hasVitals;
  if (!hasAny) return <p className="mt-1 text-muted-foreground text-xs">No structured data extracted.</p>;
  return (
    <div className="mt-2 space-y-2 text-sm">
      {symptoms.length > 0 && (
        <div>
          <span className="font-medium text-foreground">Symptoms:</span>
          <p className="text-muted-foreground">{symptoms.join(", ")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Care: clinical review and triage recommended based on symptoms.</p>
        </div>
      )}
      {conditions.length > 0 && (
        <div>
          <span className="font-medium text-foreground">Conditions:</span>
          <p className="text-muted-foreground">{conditions.join(", ")}</p>
        </div>
      )}
      {medications.length > 0 && (
        <div>
          <span className="font-medium text-foreground">Medications:</span>
          <p className="text-muted-foreground">{medications.join(", ")}</p>
        </div>
      )}
      {hasVitals && (
        <div>
          <span className="font-medium text-foreground">Vitals:</span>
          <p className="text-muted-foreground">
            {[vitals.bp && `BP ${vitals.bp}`, vitals.heartRate != null && `HR ${vitals.heartRate}`, vitals.temperature != null && `Temp ${vitals.temperature}°F`, vitals.spO2 != null && `SpO2 ${vitals.spO2}%`].filter(Boolean).join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}

export type UploadedDocumentRecord = {
  id: string;
  fileUrl: string;
  extractedText: string;
  structuredData: EhrStructuredData | null;
  processingStatus: string;
  processingError: string | null;
  createdAt: string;
};

type Props = {
  documents: UploadedDocumentRecord[];
  applyDataRef: React.MutableRefObject<((data: import("@/lib/ai/ehrTypes").EhrFormData) => void) | null>;
  onDocumentComplete: () => void;
};

export function DocumentList({
  documents,
  onDocumentComplete,
}: Props) {
  const [pollingIds, setPollingIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const processingIds = documents
    .filter(
      (d) =>
        d.processingStatus === "UPLOADED" || d.processingStatus === "PROCESSING"
    )
    .map((d) => d.id);

  useEffect(() => {
    if (processingIds.length === 0) return;
    const id = processingIds[0];
    if (pollingIds.has(id)) return;
    setPollingIds((prev) => new Set(prev).add(id));
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/documents/${id}/status`);
        const data = await res.json();
        const status = data.processingStatus;
        if (status === "AI_EXTRACTED" || status === "FAILED") {
          setPollingIds((p) => {
            const next = new Set(p);
            next.delete(id);
            return next;
          });
          clearInterval(interval);
          onDocumentComplete();
        }
      } catch {
        // keep polling
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [processingIds.join(","), onDocumentComplete]);

  if (documents.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-muted-foreground text-sm font-medium">Patient documents</h3>
      {documents.map((doc) => {
        const isDone = doc.processingStatus === "AI_EXTRACTED";
        return (
        <Card key={doc.id} className="rounded-md border border-border bg-card">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                Document {doc.id.slice(0, 8)}
              </span>
              <Badge className={`rounded-full ${
                isDone ? "bg-primary/15 text-primary" :
                doc.processingStatus === "FAILED" ? "bg-destructive/15 text-destructive" :
                "bg-chart-3/20 text-chart-3"
              }`}>
                {doc.processingStatus === "PROCESSING" || doc.processingStatus === "UPLOADED"
                  ? "Processing…"
                  : doc.processingStatus === "AI_EXTRACTED"
                    ? "Ready"
                    : doc.processingStatus}
              </Badge>
            </div>
            {doc.processingError && (
              <p className="mt-1 text-destructive text-xs">{doc.processingError}</p>
            )}
            {isDone && doc.structuredData && (
              <>
                <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI analysis</h4>
                  <AiAnalysisBlock data={doc.structuredData} />
                </div>
                <div className="mt-2">
                  <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={() => setExpandedId((x) => (x === doc.id ? null : doc.id))}>
                    {expandedId === doc.id ? "Hide text" : "View with highlights"}
                  </Button>
                </div>
              </>
            )}
            {expandedId === doc.id && (
              <div className="mt-3">
                <DocumentViewer
                  extractedText={doc.extractedText}
                  structuredData={doc.structuredData}
                />
              </div>
            )}
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}
