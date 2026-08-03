"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";
import { useSettings } from "@/context/settings-provider";
import { getWorkspaceTitle } from "@/lib/notifications";
import { NotificationsPanel } from "./notifications-panel";

export function TopBar() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { settings } = useSettings();

  const displayName =
    settings.profile.displayName.trim() || user?.name || "User";
  const workspaceTitle = getWorkspaceTitle(displayName, admin);

  return (
    <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface-elevated/95 px-4 backdrop-blur-md sm:px-6">
      <div className="lg:hidden">
        <Logo compact />
      </div>

      <div className="hidden min-w-0 lg:block">
        <p className="truncate text-sm font-semibold text-text-primary">
          {workspaceTitle}
        </p>
        <p className="text-[10px] text-text-muted">
          {admin ? "Administrator" : "Warehouse workspace"}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationsPanel />

        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-xl border border-border bg-surface py-1.5 pl-1.5 pr-3 transition-colors hover:border-accent-primary/30 hover:bg-surface-hover"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary text-xs font-bold text-white shadow-sm">
            {user?.avatar ?? "?"}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-none text-text-primary">
              {displayName}
            </p>
            <p className="mt-0.5 text-[10px] capitalize text-text-muted">
              {user?.role ?? "user"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
