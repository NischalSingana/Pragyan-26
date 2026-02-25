"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FileUpload } from "@/components/FileUpload";
import { useDashboard } from "@/components/DashboardProvider";
import type { EhrStructuredData } from "@/lib/ai/ehrTypes";
import type { EhrFormData } from "@/lib/ai/ehrTypes";

type PatientDoc = {
  id: string;
  fileUrl: string;
  extractedText: string;
  structuredData: EhrStructuredData | null;
  processingStatus: string;
  processingError: string | null;
  createdAt: string;
};

export default function DocumentsPage() {
  const { data, refresh } = useDashboard();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDocuments, setPatientDocuments] = useState<PatientDoc[]>([]);
  const applyDataRef = useRef<((data: EhrFormData) => void) | null>(null);

  const fetchPatientDocuments = useCallback(async (patientId: string) => {
    try {
      const res = await fetch(`/api/patient/${patientId}`);
      if (!res.ok) return;
      const patient = await res.json();
      setPatientDocuments((patient.documents ?? []) as PatientDoc[]);
    } catch {
      setPatientDocuments([]);
    }
  }, []);

  useEffect(() => {
    if (selectedPatientId) fetchPatientDocuments(selectedPatientId);
    else setPatientDocuments([]);
  }, [selectedPatientId, fetchPatientDocuments]);

  const onUploadOrDocumentUpdate = useCallback(() => {
    refresh();
    if (selectedPatientId) fetchPatientDocuments(selectedPatientId);
  }, [selectedPatientId, refresh, fetchPatientDocuments]);

  const patients = data?.patients ?? [];
  const selectedPatient = selectedPatientId
    ? patients.find((p) => p.id === selectedPatientId)
    : null;

  return (
    <>
      <header className="border-b border-border bg-card px-5 py-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold text-foreground">Documents</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Select a patient → Upload report docs → AI analysis (symptoms, conditions, medications, vitals)
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-5 p-5 lg:p-8">
        {patients.length > 0 && (
          <div className="minimal-card p-4">
            <label className="mb-2 block text-sm font-medium text-foreground">1. Select patient</label>
            <select
              value={selectedPatientId ?? ""}
              onChange={(e) => setSelectedPatientId(e.target.value || null)}
              className="w-full max-w-sm rounded-md border border-input bg-card px-4 py-2 text-foreground"
            >
              <option value="">— Select patient —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.age}y · {p.recommendedDepartment}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedPatientId && (
          <div className="minimal-card border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground">
              2. Upload report documents for <span className="text-primary">{selectedPatient?.name ?? "this patient"}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              We’ll run AI analysis and show symptoms, conditions, medications, vitals, and care notes.
            </p>
          </div>
        )}

        <div className="minimal-card p-5">
          <FileUpload
            patientId={selectedPatientId}
            selectedPatientName={selectedPatient?.name}
            documents={patientDocuments}
            applyDataRef={applyDataRef}
            onUploadComplete={onUploadOrDocumentUpdate}
            onDocumentComplete={onUploadOrDocumentUpdate}
          />
        </div>

        {patients.length === 0 && (
          <p className="text-muted-foreground text-sm">Add a patient on the Patients page first, then select them here to upload report documents.</p>
        )}
      </div>
    </>
  );
}
