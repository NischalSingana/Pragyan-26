/**
 * Standardized patient metadata schema (competition / data guidelines).
 * Aligns with docs/patient-metadata-schema.json.
 * Use for synthetic data generation and CSV/JSON ingestion.
 */

export type RiskLevelOption = "LOW" | "MEDIUM" | "HIGH" | "REVIEW_REQUIRED";

export type PatientMetadataRecord = {
  Patient_ID: string;
  Age: number;
  Gender: string;
  Symptoms: string[];
  Blood_Pressure: string;
  Heart_Rate: number;
  Temperature: number;
  Pre_Existing_Conditions: string[];
  Risk_Level?: RiskLevelOption;
};

/** Convert schema field names to our internal API/DB shape (snake_case / camelCase). */
export function metadataToInternal(record: PatientMetadataRecord) {
  return {
    id: record.Patient_ID,
    age: record.Age,
    gender: record.Gender,
    symptoms: record.Symptoms,
    bloodPressure: record.Blood_Pressure,
    heartRate: record.Heart_Rate,
    temperature: record.Temperature,
    preExistingConditions: record.Pre_Existing_Conditions,
    ...(record.Risk_Level != null && { riskLevel: record.Risk_Level }),
  };
}
