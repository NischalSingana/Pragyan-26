"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = { label: string; href: string };

type Session = {
  user: { name: string; email: string; role: string };
  organization: { name: string; slug: string };
} | null;

export function AppSidebar({
  nav,
  pathname,
}: {
  nav: NavItem[];
  pathname: string;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session>(null);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user && data.organization) {
          setSession({ user: data.user, organization: data.organization });
        }
      })
      .catch(() => setSession(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setSession(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-full w-56 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <Link href="/" className="flex h-14 items-center border-b border-sidebar-border px-5">
        <span className="text-base font-semibold text-sidebar-foreground" style={{ fontFamily: "var(--font-outfit), system-ui, sans-serif" }}>
          HospIntel
        </span>
      </Link>
      <nav className="flex-1 space-y-0.5 p-3">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4 space-y-2">
        {session && (
          <>
            <p className="text-xs font-medium text-sidebar-foreground truncate" title={session.organization.name}>
              {session.organization.name}
            </p>
            <p className="text-xs text-muted-foreground truncate" title={session.user.email}>
              {session.user.name}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-medium text-primary hover:underline"
            >
              Sign out
            </button>
          </>
        )}
        {!session && (
          <>
            <p className="text-xs font-medium text-muted-foreground">Hospital Command</p>
            <p className="text-xs text-muted-foreground">Real-time optimization</p>
          </>
        )}
      </div>
    </aside>
  );
}
