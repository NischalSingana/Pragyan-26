/**
 * Phase 1 — RBAC: Protect API routes by role.
 * Role is read from header X-User-Role (defaults to TRIAGE_NURSE for backward compatibility).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequiredRoleForPath, hasRole } from "@/lib/auth/rbac";
import type { UserRoleType } from "@/lib/audit";

const DEFAULT_ROLE: UserRoleType = "TRIAGE_NURSE";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const requirement = getRequiredRoleForPath(pathname);
  if (requirement == null) {
    return NextResponse.next();
  }

  const roleHeader = request.headers.get("x-user-role")?.toUpperCase().trim();
  const userRole: UserRoleType = roleHeader && isValidRole(roleHeader)
    ? (roleHeader as UserRoleType)
    : DEFAULT_ROLE;

  if (!hasRole(userRole, requirement)) {
    return NextResponse.json(
      { error: "Forbidden", message: "Insufficient role for this route" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

function isValidRole(s: string): s is UserRoleType {
  return ["ADMIN", "TRIAGE_NURSE", "DOCTOR", "COMMAND_CENTER"].includes(s);
}

export const config = {
  matcher: ["/api/:path*"],
};
