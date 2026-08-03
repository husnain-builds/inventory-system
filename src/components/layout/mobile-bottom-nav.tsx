"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const admin = isAdmin(user);

  const mobileNavItems = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/inventory", label: "Stock", icon: Package },
    ...(admin ? [{ href: "/users", label: "Users", icon: Users }] : []),
    { href: "/analytics", label: "Stats", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav
      data-mobile-nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-elevated/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-opacity duration-200 lg:hidden"
    >
      <div className="flex items-center justify-around py-2.5">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl px-1 py-1.5 transition-all ${
                isActive
                  ? "text-accent-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  isActive ? "bg-accent-primary-light" : ""
                }`}
              >
                <item.icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </span>
              <span className="truncate text-xs font-semibold leading-none sm:text-sm">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
