"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const DEPT_ORDER = [
  "Emergency",
  "Cardiology",
  "Neurology",
  "General Medicine",
  "Orthopedics",
  "Others",
];

type DoctorWithPatients = {
  id: string;
  name: string;
  departmentName: string;
  isAvailable: boolean;
  assignedPatients: Array<{
    id: string;
    name: string;
    age: number;
    riskLevel: string;
    recommendedDepartment: string;
  }>;
};

type DoctorsData = {
  departmentWise: Record<string, DoctorWithPatients[]>;
  departments: readonly string[];
};

export default function DoctorsPage() {
  const [data, setData] = useState<DoctorsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDept, setAddDept] = useState("General Medicine");
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/doctors");
      if (!res.ok) throw new Error(await res.json().then((d) => d.error ?? "Failed to load"));
      const json = await res.json();
      setData({ departmentWise: json.departmentWise, departments: json.departments ?? DEPT_ORDER });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSubmitting(true);
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim(),
          departmentName: addDept,
          isAvailable: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to add doctor");
      setAddName("");
      setAddDept("General Medicine");
      setAddOpen(false);
      await fetchDoctors();
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Failed to add doctor");
    } finally {
      setAddSubmitting(false);
    }
  };

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
        <div className="minimal-card max-w-md p-5 text-destructive">
          <p className="font-medium">{error}</p>
          <button
            type="button"
            onClick={() => fetchDoctors()}
            className="mt-3 rounded-md border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sortedEntries = data
    ? [...Object.entries(data.departmentWise)].sort(
        (a, b) =>
          DEPT_ORDER.indexOf(a[0]) - DEPT_ORDER.indexOf(b[0]) || a[0].localeCompare(b[0])
      )
    : [];

  return (
    <>
      <header className="border-b border-border bg-card px-5 py-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl" style={{ fontFamily: "var(--font-outfit), system-ui, sans-serif" }}>
              Doctors by department
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              View doctors, add new, and see assigned patients. High-priority patients are auto-assigned to a random doctor in their department.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add doctor
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 p-5 lg:p-8">
        {addOpen && (
          <div className="minimal-card p-5">
            <h2 className="text-lg font-semibold text-foreground">Add doctor</h2>
            <form onSubmit={handleAddDoctor} className="mt-4 flex flex-wrap gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Department</label>
                <select
                  value={addDept}
                  onChange={(e) => setAddDept(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {(data?.departments ?? DEPT_ORDER).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {addSubmitting ? "Adding…" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
            {addError && <p className="mt-2 text-sm text-destructive">{addError}</p>}
          </div>
        )}

        <section className="minimal-card p-5">
          {sortedEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No doctors yet. Add one above or run db:seed for demo data.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedEntries.map(([departmentName, doctors]) => (
                <div
                  key={departmentName}
                  className="rounded-lg border border-primary/20 bg-card px-4 py-3 shadow-sm"
                >
                  <p className="text-sm font-semibold text-foreground">{departmentName}</p>
                  <ul className="mt-2 space-y-2">
                    {doctors.map((d) => (
                      <li key={d.id} className="border-t border-border/50 pt-2 first:mt-2 first:border-t first:pt-2">
                        <span className="text-sm text-foreground">{d.name}</span>
                        {d.assignedPatients.length > 0 && (
                          <div className="mt-1.5 text-xs text-muted-foreground">
                            <span className="font-medium text-muted-foreground">Assigned patients:</span>
                            <ul className="mt-0.5 space-y-0.5 pl-1">
                              {d.assignedPatients.map((p) => (
                                <li key={p.id}>
                                  <Link
                                    href={`/patients?highlight=${p.id}`}
                                    className="text-primary hover:underline"
                                  >
                                    {p.name}
                                  </Link>
                                  <span className="ml-1">
                                    {" "}
                                    ({p.age}y · {p.riskLevel})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
