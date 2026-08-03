"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/inventory/page-header";
import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";
import { useInventory } from "@/context/inventory-provider";
import { useSettings } from "@/context/settings-provider";
import {
  DENSITY_LABELS,
  FREQUENCY_LABELS,
  LANGUAGE_LABELS,
  THEME_LABELS,
  type Density,
  type EmailReportFrequency,
  type Language,
  type Theme,
} from "@/lib/settings-store";
import {
  LogOut,
  User,
  Bell,
  Palette,
  Shield,
  Mail,
  Building2,
  Package,
  Check,
} from "lucide-react";

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? "bg-accent-primary" : "bg-surface-muted"}`}
    >
      <div
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

function OptionGroup<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labels: Record<T, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            value === opt
              ? "bg-accent-primary text-white shadow-sm"
              : "border border-border bg-surface text-text-secondary hover:bg-surface-hover"
          }`}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const admin = isAdmin(user);
  const { getVisibleItems, getAlertItems } = useInventory();
  const {
    settings,
    toggleNotification,
    setTheme,
    setDensity,
    setLanguage,
    setEmailFrequency,
    updateProfile,
  } = useSettings();

  const [nameInput, setNameInput] = useState("");
  const [deptInput, setDeptInput] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  const items = getVisibleItems(admin, user?.id ?? "");
  const alerts = getAlertItems(admin, user?.id ?? "");

  useEffect(() => {
    setNameInput(settings.profile.displayName || user?.name || "");
    setDeptInput(settings.profile.department || user?.department || "");
  }, [settings.profile.displayName, settings.profile.department, user?.name, user?.department]);

  function saveProfile() {
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      setProfileError("Display name cannot be empty.");
      setProfileSaved(false);
      return;
    }
    setProfileError("");
    updateProfile({
      displayName: trimmedName,
      department: deptInput.trim(),
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  const notifItems: {
    key: "lowStockAlerts" | "emailReports" | "pushNotifications" | "weeklyDigest";
    label: string;
  }[] = [
    { key: "lowStockAlerts", label: "Low Stock Alerts" },
    { key: "emailReports", label: "Email Reports" },
    { key: "pushNotifications", label: "Push Notifications" },
    { key: "weeklyDigest", label: "Weekly Digest" },
  ];

  return (
    <div className="page-shell">
      <PageHeader
        title="Settings"
        subtitle="Account, notifications, and app preferences."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="lg:col-span-4">
          <div className="glass-card glass-card-glow overflow-hidden rounded-2xl">
            <div className="bg-gradient-to-br from-accent-primary to-indigo-600 px-5 py-6 text-white">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold backdrop-blur-sm">
                  {user?.avatar ?? "?"}
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {settings.profile.displayName || user?.name}
                  </p>
                  <p className="text-sm text-indigo-100">
                    {admin ? "Administrator" : "Warehouse User"}
                  </p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center gap-3 px-5 py-3.5">
                <Mail className="h-4 w-4 text-text-muted" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    Email
                  </p>
                  <p className="truncate text-sm font-medium text-text-primary">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5">
                <Building2 className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    Department
                  </p>
                  <p className="text-sm font-medium text-text-primary">
                    {settings.profile.department || user?.department || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5">
                <Shield className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    Access Level
                  </p>
                  <p className="text-sm font-medium text-text-primary">
                    {admin ? "Full system access" : "Own inventory only"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-4 text-center transition-shadow hover:shadow-md">
              <Package className="mx-auto mb-2 h-5 w-5 text-accent-primary" />
              <p className="text-xl font-bold text-text-primary">
                {items.length}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Items
              </p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center transition-shadow hover:shadow-md">
              <Bell className="mx-auto mb-2 h-5 w-5 text-accent-warning" />
              <p className="text-xl font-bold text-text-primary">
                {alerts.length}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Alerts
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:gap-5">
          <div className="glass-card glass-card-glow overflow-hidden rounded-2xl sm:col-span-2">
            <div className="flex items-center gap-2 border-b border-border bg-surface px-5 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary-light">
                <Bell className="h-4 w-4 text-accent-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Notifications
                </h3>
                <p className="text-xs text-text-muted">
                  Saved automatically to your account
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {notifItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <span className="text-sm font-medium text-text-secondary">
                    {item.label}
                  </span>
                  <Toggle
                    enabled={settings.notifications[item.key]}
                    onToggle={() => toggleNotification(item.key)}
                  />
                </div>
              ))}
            </div>
            <div className="border-t border-border px-5 py-4">
              <p className="mb-2 text-xs font-medium text-text-secondary">
                Email Report Frequency
              </p>
              <OptionGroup
                options={["daily", "weekly", "monthly", "off"] as EmailReportFrequency[]}
                value={settings.notifications.emailReportFrequency}
                onChange={setEmailFrequency}
                labels={FREQUENCY_LABELS}
              />
            </div>
          </div>

          <div className="glass-card glass-card-glow overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 border-b border-border bg-surface px-5 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-info-light">
                <User className="h-4 w-4 text-accent-info" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">Profile</h3>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Display Name
                </label>
                <input
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (profileError) setProfileError("");
                  }}
                  className={`w-full rounded-xl border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 ${
                    profileError
                      ? "border-accent-danger focus:border-accent-danger/50 focus:ring-accent-danger/15"
                      : "border-border focus:border-accent-primary/50 focus:ring-accent-primary/15"
                  }`}
                  placeholder="Your display name"
                />
                {profileError && (
                  <p className="mt-1 text-xs text-accent-danger">{profileError}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Department
                </label>
                <input
                  value={deptInput}
                  onChange={(e) => setDeptInput(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/15"
                  placeholder="Your department"
                />
              </div>
              <button
                type="button"
                onClick={saveProfile}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary py-2.5 text-sm font-semibold text-white hover:bg-accent-primary/90"
              >
                {profileSaved ? (
                  <>
                    <Check className="h-4 w-4" /> Saved
                  </>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </div>

          <div className="glass-card glass-card-glow overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 border-b border-border bg-surface px-5 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-success-light">
                <Palette className="h-4 w-4 text-accent-success" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">
                Appearance
              </h3>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <p className="mb-2 text-xs font-medium text-text-secondary">
                  Theme
                </p>
                <OptionGroup
                  options={["light", "dark"] as Theme[]}
                  value={settings.appearance.theme}
                  onChange={setTheme}
                  labels={THEME_LABELS}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-text-secondary">
                  Density
                </p>
                <OptionGroup
                  options={["comfortable", "compact"] as Density[]}
                  value={settings.appearance.density}
                  onChange={setDensity}
                  labels={DENSITY_LABELS}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-text-secondary">
                  Language
                </p>
                <OptionGroup
                  options={["english", "spanish", "french"] as Language[]}
                  value={settings.appearance.language}
                  onChange={setLanguage}
                  labels={LANGUAGE_LABELS}
                />
              </div>
            </div>
          </div>

          <div className="glass-card flex flex-col justify-between overflow-hidden rounded-2xl border-accent-danger/20 sm:col-span-2">
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-danger-light">
                <LogOut className="h-5 w-5 text-accent-danger" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Sign Out</p>
                <p className="text-xs text-text-muted">
                  End your current session on this device
                </p>
              </div>
            </div>
            <div className="border-t border-border bg-surface px-5 py-3">
              <button
                type="button"
                onClick={signOut}
                className="w-full rounded-xl bg-accent-danger py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-danger/90"
              >
                Sign Out of StockFlow
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
