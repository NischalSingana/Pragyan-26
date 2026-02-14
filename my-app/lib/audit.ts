/**
 * Audit logging for triage, safety overrides, reroutes, and AI disagreement.
 * Phase 1 — Audit Log System.
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AuditAction =
  | "TRIAGE_RESULT"
  | "SAFETY_OVERRIDE"
  | "MANUAL_REROUTE"
  | "AI_DISAGREEMENT"
  | "PATIENT_CREATED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_PROCESSED"
  | "DOCUMENT_FAILED";

export type UserRoleType = "ADMIN" | "TRIAGE_NURSE" | "DOCTOR" | "COMMAND_CENTER";

export type AuditPayload = {
  action: AuditAction;
  userRole: UserRoleType;
  patientId?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Create an audit log entry. Fire-and-forget; does not throw.
 */
export async function auditLog(payload: AuditPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: payload.action,
        userRole: payload.userRole,
        patientId: payload.patientId ?? null,
        metadata: (payload.metadata ?? undefined) as Prisma.InputJsonValue,
      },
    });
  } catch (e) {
    console.error("[AuditLog] Failed to write audit:", e);
  }
}

/**
 * Get role from request (header X-User-Role for API routes). Defaults to TRIAGE_NURSE.
 */
export function getRoleFromRequest(headers: Headers): UserRoleType {
  const role = headers.get("x-user-role")?.toUpperCase().trim();
  const allowed: UserRoleType[] = ["ADMIN", "TRIAGE_NURSE", "DOCTOR", "COMMAND_CENTER"];
  if (role && allowed.includes(role as UserRoleType)) {
    return role as UserRoleType;
  }
  return "TRIAGE_NURSE";
}
