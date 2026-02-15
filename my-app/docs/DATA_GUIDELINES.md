# Data Guidelines — Patient Metadata Schema

Teams must generate **synthetic data** using a **Synthetic Data Vault (SDV)–like tool** or equivalent framework. This document describes the standardized patient metadata schema and how this project supports it.

## Standardized Metadata Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Patient_ID** | string (UUID) | Yes | Unique patient identifier |
| **Age** | integer (0–150) | Yes | Patient age in years |
| **Gender** | string | Yes | e.g. Male, Female, Other |
| **Symptoms** | array of strings | Yes | Reported symptoms |
| **Blood_Pressure** | string | Yes | e.g. `120/80` |
| **Heart_Rate** | integer (0–300) | Yes | Beats per minute |
| **Temperature** | number | Yes | Temperature in °F (e.g. 97–104) |
| **Pre_Existing_Conditions** | array of strings | Yes | Prior medical conditions |
| **Risk_Level** | string | No (optional for training) | `LOW` \| `MEDIUM` \| `HIGH` \| `REVIEW_REQUIRED` |

## Schema and Types

- **JSON Schema:** `docs/patient-metadata-schema.json` — use for validation and SDV/pipeline integration.
- **TypeScript type:** `types/patient-metadata.ts` — `PatientMetadataRecord` and optional `metadataToInternal()` for mapping to app models.

## Synthetic Data Generator (This Repo)

This repo includes an **SDV-like** generator that outputs data conforming to the schema:

```bash
# Generate 100 records as JSON (default seed 42)
npx tsx scripts/generate-synthetic-patients.ts --count 100 --output data/synthetic-patients.json

# Generate 50 records as CSV (for Python/Excel)
npx tsx scripts/generate-synthetic-patients.ts --count 50 --seed 42 --output data/patients.json --csv data/patients.csv

# Generate and seed the database
npx tsx scripts/generate-synthetic-patients.ts --count 30 --seed-db --output data/synthetic.json
```

- **Reproducibility:** Use `--seed <number>` for the same sequence of records.
- **Output:** `--output` writes JSON; `--csv` writes CSV. Omit both to print JSON to stdout.
- **Seeding:** `--seed-db` creates patients in the app database (adds synthetic name and department).

## Using External SDV or Other Tools

If you use **Synthetic Data Vault (Python)** or another framework:

1. Use `docs/patient-metadata-schema.json` as the target schema.
2. Map your generated fields to the exact names above (e.g. `Patient_ID`, `Blood_Pressure`, `Pre_Existing_Conditions`).
3. Export JSON or CSV and ingest via your API or a one-off script that maps `PatientMetadataRecord` to your storage.

## Sample Record (JSON)

```json
{
  "Patient_ID": "550e8400-e29b-41d4-a716-446655440000",
  "Age": 45,
  "Gender": "Male",
  "Symptoms": ["Chest pain", "Shortness of breath"],
  "Blood_Pressure": "140/90",
  "Heart_Rate": 88,
  "Temperature": 98.6,
  "Pre_Existing_Conditions": ["Hypertension", "Diabetes"],
  "Risk_Level": "MEDIUM"
}
```
