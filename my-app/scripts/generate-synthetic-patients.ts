#!/usr/bin/env npx tsx
/**
 * Synthetic patient data generator (SDV-like).
 * Produces data conforming to docs/patient-metadata-schema.json.
 *
 * Usage:
 *   npx tsx scripts/generate-synthetic-patients.ts --count 100 --output data/synthetic-patients.json
 *   npx tsx scripts/generate-synthetic-patients.ts --count 50 --seed 42 --seed-db
 */

import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import type { PatientMetadataRecord, RiskLevelOption } from "../types/patient-metadata";

const DEPARTMENTS = ["General Medicine", "Emergency", "Cardiology", "Neurology", "Orthopedics", "Others"];

const SYMPTOMS_POOL = [
  "Chest pain", "Shortness of breath", "Headache", "Fever", "Dizziness", "Nausea",
  "Abdominal pain", "Fatigue", "Cough", "Joint pain", "Back pain", "Rash",
  "Sore throat", "Weakness", "Confusion", "Chest tightness", "Palpitations",
];

const CONDITIONS_POOL = [
  "Diabetes", "Hypertension", "Asthma", "COPD", "Heart disease", "Kidney disease",
  "Cancer history", "Obesity", "Anxiety", "Depression", "Thyroid disorder", "Anemia",
];

const GENDERS = ["Male", "Female", "Other"];

/** Seeded RNG for reproducible synthetic data (mulberry32). */
function createRng(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rng: () => number, min = 1, max = 4): T[] {
  const n = Math.floor(min + rng() * (max - min + 1));
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function pickOne<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function range(min: number, max: number, rng: () => number): number {
  return Math.floor(min + rng() * (max - min + 1));
}

function rangeFloat(min: number, max: number, rng: () => number, decimals = 1): number {
  const v = min + rng() * (max - min);
  return Math.round(v * 10 ** decimals) / 10 ** decimals;
}

export function generateOne(seed: number): PatientMetadataRecord {
  const rng = createRng(seed);
  const systolic = range(90, 160, rng);
  const diastolic = range(60, 99, rng);
  const riskLevels: RiskLevelOption[] = ["LOW", "MEDIUM", "HIGH", "REVIEW_REQUIRED"];
  return {
    Patient_ID: randomUUID(),
    Age: range(1, 95, rng),
    Gender: pickOne(GENDERS, rng),
    Symptoms: pick(SYMPTOMS_POOL, rng),
    Blood_Pressure: `${systolic}/${diastolic}`,
    Heart_Rate: range(55, 120, rng),
    Temperature: rangeFloat(97.0, 103.0, rng),
    Pre_Existing_Conditions: pick(CONDITIONS_POOL, rng, 0, 3),
    Risk_Level: pickOne(riskLevels, rng),
  };
}

export function generateMany(count: number, baseSeed: number): PatientMetadataRecord[] {
  const out: PatientMetadataRecord[] = [];
  for (let i = 0; i < count; i++) {
    out.push(generateOne(baseSeed + i));
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  let count = 50;
  let seed = 42;
  let outputPath: string | null = null;
  let csvPath: string | null = null;
  let seedDb = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--count" && args[i + 1]) {
      count = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--seed" && args[i + 1]) {
      seed = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--output" && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    } else if (args[i] === "--csv" && args[i + 1]) {
      csvPath = args[i + 1];
      i++;
    } else if (args[i] === "--seed-db") {
      seedDb = true;
    }
  }

  const records = generateMany(count, seed);

  const writeDir = (filePath: string) => {
    const dir = path.dirname(filePath);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  };

  if (outputPath) {
    writeDir(outputPath);
    fs.writeFileSync(outputPath, JSON.stringify(records, null, 2), "utf-8");
    console.log(`Wrote ${records.length} records to ${outputPath}`);
  } else if (!csvPath && !seedDb) {
    console.log(JSON.stringify(records, null, 2));
  }

  if (csvPath) {
    writeDir(csvPath);
    const header = "Patient_ID,Age,Gender,Symptoms,Blood_Pressure,Heart_Rate,Temperature,Pre_Existing_Conditions,Risk_Level";
    const rows = records.map((r) =>
      [
        r.Patient_ID,
        r.Age,
        `"${r.Gender.replace(/"/g, '""')}"`,
        `"${r.Symptoms.join(";").replace(/"/g, '""')}"`,
        r.Blood_Pressure,
        r.Heart_Rate,
        r.Temperature,
        `"${r.Pre_Existing_Conditions.join(";").replace(/"/g, '""')}"`,
        r.Risk_Level ?? "",
      ].join(",")
    );
    fs.writeFileSync(csvPath, [header, ...rows].join("\n"), "utf-8");
    console.log(`Wrote ${records.length} records (CSV) to ${csvPath}`);
  }

  if (seedDb && records.length > 0) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const rng = createRng(seed);
    for (const r of records) {
      await prisma.patient.create({
        data: {
          name: `Synthetic Patient ${r.Patient_ID.slice(0, 8)}`,
          age: r.Age,
          gender: r.Gender,
          symptoms: r.Symptoms,
          bloodPressure: r.Blood_Pressure,
          heartRate: r.Heart_Rate,
          temperature: r.Temperature,
          preExistingConditions: r.Pre_Existing_Conditions,
          riskLevel: (r.Risk_Level ?? "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "REVIEW_REQUIRED",
          recommendedDepartment: pickOne(DEPARTMENTS, rng),
        },
      });
    }
    console.log(`Seeded ${records.length} synthetic patients into the database.`);
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
