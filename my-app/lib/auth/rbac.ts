/**
 * Role-Based Access Control.
 * Phase 1 — Route protection by role.
 */

import type { UserRoleType } from "@/lib/audit";

export type RouteRoleRequirement = UserRoleType | UserRoleType[];

const ROLE_HIERARCHY: Record<UserRoleType, number> = {
  ADMIN: 4,
  COMMAND_CENTER: 3,
  DOCTOR: 2,
  TRIAGE_NURSE: 1,
};

/**
 * Check if userRole satisfies the requirement (exact match or hierarchy).
 * If requirement is an array, user must have at least one of the roles.
 */
export function hasRole(userRole: UserRoleType, requirement: RouteRoleRequirement): boolean {
  const roles = Array.isArray(requirement) ? requirement : [requirement];
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  for (const r of roles) {
    const requiredLevel = ROLE_HIERARCHY[r];
    if (userLevel >= requiredLevel) return true;
    if (userRole === r) return true;
  }
  return false;
}

/**
 * Route-to-role mapping. Path prefix match.
 */
export const ROUTE_ROLES: Array<{ path: string; roles: RouteRoleRequirement }> = [
  { path: "/api/dashboard", roles: ["TRIAGE_NURSE", "DOCTOR", "COMMAND_CENTER", "ADMIN"] },
  { path: "/api/triage", roles: ["TRIAGE_NURSE", "DOCTOR", "COMMAND_CENTER", "ADMIN"] },
  { path: "/api/patient", roles: ["TRIAGE_NURSE", "DOCTOR", "COMMAND_CENTER", "ADMIN"] },
  { path: "/api/upload", roles: ["TRIAGE_NURSE", "DOCTOR", "COMMAND_CENTER", "ADMIN"] },
  { path: "/api/documents", roles: ["TRIAGE_NURSE", "DOCTOR", "COMMAND_CENTER", "ADMIN"] },
  { path: "/api/extract-pdf", roles: ["TRIAGE_NURSE", "DOCTOR", "COMMAND_CENTER", "ADMIN"] },
  { path: "/api/audit", roles: ["ADMIN", "COMMAND_CENTER"] },
  { path: "/api/surge", roles: ["ADMIN", "COMMAND_CENTER"] },
];

export function getRequiredRoleForPath(pathname: string): RouteRoleRequirement | null {
  for (const { path, roles } of ROUTE_ROLES) {
    if (pathname === path || pathname.startsWith(path + "/")) {
      return roles;
    }
  }
  return null;
}
