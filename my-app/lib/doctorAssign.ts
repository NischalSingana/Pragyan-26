import type { PrismaClient } from "@prisma/client";

/**
 * Pick a random available doctor for the given department.
 * Used when auto-assigning high-priority patients.
 */
export async function pickRandomDoctorByDepartment(
  prisma: PrismaClient,
  departmentName: string
): Promise<{ id: string } | null> {
  const doctors = await prisma.doctor.findMany({
    where: { departmentName, isAvailable: true },
    select: { id: true },
    take: 50,
  });
  if (doctors.length === 0) return null;
  const idx = Math.floor(Math.random() * doctors.length);
  return doctors[idx];
}
