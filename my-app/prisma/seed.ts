import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.departmentLoad.upsert({
    where: { departmentName: "General Medicine" },
    update: {},
    create: {
      departmentName: "General Medicine",
      currentPatients: 12,
      availableDoctors: 4,
      avgWaitTime: 25,
    },
  });
  await prisma.departmentLoad.upsert({
    where: { departmentName: "Emergency" },
    update: {},
    create: {
      departmentName: "Emergency",
      currentPatients: 8,
      availableDoctors: 3,
      avgWaitTime: 15,
    },
  });
  await prisma.departmentLoad.upsert({
    where: { departmentName: "Cardiology" },
    update: {},
    create: {
      departmentName: "Cardiology",
      currentPatients: 5,
      availableDoctors: 2,
      avgWaitTime: 40,
    },
  });
  await prisma.departmentLoad.upsert({
    where: { departmentName: "Neurology" },
    update: {},
    create: {
      departmentName: "Neurology",
      currentPatients: 3,
      availableDoctors: 2,
      avgWaitTime: 35,
    },
  });
  await prisma.departmentLoad.upsert({
    where: { departmentName: "Orthopedics" },
    update: {},
    create: {
      departmentName: "Orthopedics",
      currentPatients: 6,
      availableDoctors: 2,
      avgWaitTime: 30,
    },
  });
  await prisma.departmentLoad.upsert({
    where: { departmentName: "Others" },
    update: {},
    create: {
      departmentName: "Others",
      currentPatients: 4,
      availableDoctors: 2,
      avgWaitTime: 20,
    },
  });
  console.log("Seeded department loads.");

  // Demo doctors per department
  const doctorData: Array<{ name: string; departmentName: string }> = [
    { name: "Dr. Sarah Chen", departmentName: "General Medicine" },
    { name: "Dr. James Wilson", departmentName: "General Medicine" },
    { name: "Dr. Priya Sharma", departmentName: "General Medicine" },
    { name: "Dr. Michael Torres", departmentName: "Emergency" },
    { name: "Dr. Emily Park", departmentName: "Emergency" },
    { name: "Dr. David Okonkwo", departmentName: "Emergency" },
    { name: "Dr. Lisa Nguyen", departmentName: "Cardiology" },
    { name: "Dr. Robert Kim", departmentName: "Cardiology" },
    { name: "Dr. Anna Patel", departmentName: "Neurology" },
    { name: "Dr. Thomas Wright", departmentName: "Neurology" },
    { name: "Dr. Maria Santos", departmentName: "Orthopedics" },
    { name: "Dr. John Foster", departmentName: "Orthopedics" },
    { name: "Dr. Rachel Green", departmentName: "Others" },
    { name: "Dr. Kevin Lee", departmentName: "Others" },
  ];
  for (const d of doctorData) {
    await prisma.doctor.upsert({
      where: {
        departmentName_name: { departmentName: d.departmentName, name: d.name },
      },
      update: { isAvailable: true },
      create: {
        name: d.name,
        departmentName: d.departmentName,
        isAvailable: true,
      },
    });
  }
  console.log("Seeded demo doctors.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
