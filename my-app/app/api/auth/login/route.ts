import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { z } from "zod";

const loginSchema = z.object({
  orgSlug: z.string().min(1, "Organization identifier is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join("; ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { orgSlug, email, password } = parsed.data;

    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug.trim().toLowerCase() },
    });
    if (!org) {
      return NextResponse.json(
        { error: "No organization found with this identifier." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId: org.id,
          email: email.toLowerCase(),
        },
      },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await createSession({
      userId: user.id,
      orgId: org.id,
      orgName: org.name,
      orgSlug: org.slug,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      organization: { id: org.id, name: org.name, slug: org.slug },
    });
  } catch (e) {
    console.error("POST /api/auth/login:", e);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
