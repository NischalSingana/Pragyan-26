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
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
