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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-elevated/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all ${
                isActive
                  ? "text-accent-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                  isActive ? "bg-accent-primary-light" : ""
                }`}
              >
                <item.icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </span>
              <span className="truncate text-[10px] font-semibold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
