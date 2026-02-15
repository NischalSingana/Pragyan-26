"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user && data.organization) router.replace("/");
      })
      .catch(() => {});
  }, [router]);

  const deriveSlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setOrganizationName(v);
    if (!organizationSlug || organizationSlug === deriveSlug(organizationName)) {
      setOrganizationSlug(deriveSlug(v));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: organizationName.trim(),
          organizationSlug: organizationSlug.trim().toLowerCase() || deriveSlug(organizationName),
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1
          className="text-2xl font-semibold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-outfit), system-ui, sans-serif" }}
        >
          HospIntel
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Register your organization and create an admin account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="organizationName" className="text-foreground">
            Organization name
          </Label>
          <Input
            id="organizationName"
            type="text"
            placeholder="e.g. City General Hospital"
            value={organizationName}
            onChange={handleOrgNameChange}
            required
            className="h-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationSlug" className="text-foreground">
            Organization URL slug
          </Label>
          <Input
            id="organizationSlug"
            type="text"
            placeholder="city-general-hospital"
            value={organizationSlug}
            onChange={(e) => setOrganizationSlug(e.target.value.replace(/[^a-z0-9-]/g, "").toLowerCase())}
            required
            className="h-10 border-border bg-background font-mono text-sm text-foreground placeholder:text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Lowercase letters, numbers, and hyphens only. Used for sign-in.
          </p>
        </div>

        <hr className="border-border" />

        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">
            Your name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Dr. Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="h-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@hospital.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="h-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-foreground">
            Confirm password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="h-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-10 w-full font-medium"
        >
          {loading ? "Creating account…" : "Create organization & account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
