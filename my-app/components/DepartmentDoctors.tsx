"use client";

/**
 * Department-wise doctors list for command center.
 */

type Doctor = {
  id: string;
  name: string;
  departmentName: string;
};

type Props = {
  departmentWiseDoctors: Record<string, Doctor[]>;
};

const DEPT_ORDER = [
  "Emergency",
  "Cardiology",
  "Neurology",
  "General Medicine",
  "Orthopedics",
  "Others",
];

export function DepartmentDoctors({ departmentWiseDoctors }: Props) {
  const entries = Object.entries(departmentWiseDoctors);
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No doctor data. Run db:seed to add demo doctors.</p>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => DEPT_ORDER.indexOf(a[0]) - DEPT_ORDER.indexOf(b[0]) || a[0].localeCompare(b[0])
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Doctors by department</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map(([departmentName, doctors]) => (
          <div
            key={departmentName}
            className="rounded-md border border-border bg-muted/30 px-3 py-2"
          >
            <p className="text-xs font-medium text-foreground">{departmentName}</p>
            <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
              {doctors.map((d) => (
                <li key={d.id}>{d.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
