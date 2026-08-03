"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";
import { useInventory } from "@/context/inventory-provider";

const statusColors = {
  "in-stock": "text-accent-success bg-accent-success-light",
  "low-stock": "text-accent-warning bg-accent-warning-light",
  "out-of-stock": "text-accent-danger bg-accent-danger-light",
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const admin = isAdmin(user);
  const { getAlertItems } = useInventory();

  const sidebarItems = getAlertItems(admin, user?.id ?? "").slice(0, 3);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/inventory",
      label: admin ? "All Inventory" : "My Inventory",
      icon: Package,
    },
    ...(admin ? [{ href: "/users", label: "All Users", icon: Users }] : []),
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface-elevated lg:flex xl:w-72">
      <div className="shrink-0 border-b border-border px-5 py-5">
        <Logo />
      </div>

      <nav className="shrink-0 space-y-1 px-4 py-4">
        {navLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent-primary-light text-accent-primary shadow-sm"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              <link.icon
                className={`h-4 w-4 shrink-0 ${isActive ? "text-accent-primary" : ""}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {sidebarItems.length > 0 && (
          <>
            <p className="section-label mb-3 px-1">
              {admin ? "Stock Alerts" : "Needs Attention"}
            </p>
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href="/inventory"
                    className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-accent-primary/30 hover:shadow-sm"
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${statusColors[item.status]}`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {item.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {item.quantity} / {item.minStock} min
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {user && (
        <div className="shrink-0 border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary text-sm font-bold text-white shadow-sm">
              {user.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">
                {user.name}
              </p>
              <p className="truncate text-xs capitalize text-text-muted">
                {user.role}
                {user.department ? ` · ${user.department}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-accent-danger/30 hover:bg-accent-danger-light hover:text-accent-danger"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
