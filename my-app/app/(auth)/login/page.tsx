"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [orgSlug, setOrgSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgSlug: orgSlug.trim().toLowerCase(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
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
          Hospital Command · Sign in to your organization
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="orgSlug" className="text-foreground">
            Organization
          </Label>
          <Input
            id="orgSlug"
            type="text"
            placeholder="e.g. city-hospital"
            value={orgSlug}
            onChange={(e) => setOrgSlug(e.target.value)}
            required
            autoComplete="organization"
            className="h-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Your organization&apos;s unique identifier (lowercase, no spaces)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@hospital.org"
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
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
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an organization?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Register your organization
        </Link>
      </p>
    </div>
  );
}
