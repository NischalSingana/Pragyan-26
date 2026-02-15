import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { z } from "zod";

const registerSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters").max(100),
  organizationSlug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join("; ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { organizationName, organizationSlug, name, email, password } = parsed.data;

    const existingOrg = await prisma.organization.findUnique({
      where: { slug: organizationSlug },
    });
    if (existingOrg) {
      return NextResponse.json(
        { error: "An organization with this slug already exists. Choose another." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const org = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: organizationSlug,
      },
    });

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: "ADMIN",
        organizationId: org.id,
      },
    });

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

    return NextResponse.json(
      {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        organization: { id: org.id, name: org.name, slug: org.slug },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/auth/register:", e);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
