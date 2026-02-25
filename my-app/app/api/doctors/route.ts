import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const DEPARTMENTS = [
  "General Medicine",
  "Emergency",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Others",
] as const;

const createDoctorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  departmentName: z.enum(DEPARTMENTS),
  isAvailable: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: [{ departmentName: "asc" }, { name: "asc" }],
      include: {
        assignedPatients: {
          select: { id: true, name: true, age: true, riskLevel: true, recommendedDepartment: true },
        },
      },
    });
    const byDept = doctors.reduce(
      (acc, d) => {
        const dept = d.departmentName;
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push({
          id: d.id,
          name: d.name,
          departmentName: d.departmentName,
          isAvailable: d.isAvailable,
          assignedPatients: d.assignedPatients,
        });
        return acc;
      },
      {} as Record<
        string,
        Array<{
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
        }>
      >
    );
    return NextResponse.json({
      doctors,
      departmentWise: byDept,
      departments: DEPARTMENTS,
    });
  } catch (e) {
    console.error("GET /api/doctors:", e);
    return NextResponse.json({ error: "Failed to load doctors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createDoctorSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join("; ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const doctor = await prisma.doctor.create({
      data: {
        name: parsed.data.name.trim(),
        departmentName: parsed.data.departmentName,
        isAvailable: parsed.data.isAvailable ?? true,
      },
    });
    return NextResponse.json(doctor, { status: 201 });
  } catch (e) {
    console.error("POST /api/doctors:", e);
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("Unique constraint") || message.includes("departmentName_name"))
      return NextResponse.json(
        { error: "A doctor with this name already exists in this department." },
        { status: 409 }
      );
    return NextResponse.json({ error: "Failed to add doctor" }, { status: 500 });
  }
}
