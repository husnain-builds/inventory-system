"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_SETTINGS,
  getSettingsForUser,
  saveSettingsForUser,
  type AppSettings,
  type AppearanceSettings,
  type NotificationSettings,
  type ProfileSettings,
  type Density,
  type Language,
  type Theme,
  type EmailReportFrequency,
} from "@/lib/settings-store";
import { useAuth } from "@/context/auth-provider";

interface SettingsContextValue {
  settings: AppSettings;
  isLoading: boolean;
  updateNotifications: (patch: Partial<NotificationSettings>) => void;
  updateAppearance: (patch: Partial<AppearanceSettings>) => void;
  updateProfile: (patch: Partial<ProfileSettings>) => void;
  toggleNotification: (key: keyof NotificationSettings) => void;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  setLanguage: (language: Language) => void;
  setEmailFrequency: (freq: EmailReportFrequency) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function applyDensity(density: Density) {
  document.documentElement.dataset.density = density;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUserProfile } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      setIsLoading(false);
      return;
    }
    const loaded = getSettingsForUser(user.email);
    const merged: AppSettings = {
      ...loaded,
      profile: {
        displayName: loaded.profile.displayName || user.name,
        department: loaded.profile.department || user.department || "",
      },
    };
    setSettings(merged);
    applyTheme(merged.appearance.theme);
    applyDensity(merged.appearance.density);
    setIsLoading(false);
  }, [user]);

  const save = useCallback(
    (next: AppSettings) => {
      if (!user) return;
      setSettings(next);
      saveSettingsForUser(user.email, next);
      applyTheme(next.appearance.theme);
      applyDensity(next.appearance.density);

      updateUserProfile({
        name: next.profile.displayName || user.name,
        department: next.profile.department || user.department,
      });
    },
    [user, updateUserProfile]
  );

  const updateNotifications = useCallback(
    (patch: Partial<NotificationSettings>) => {
      save({ ...settings, notifications: { ...settings.notifications, ...patch } });
    },
    [settings, save]
  );

  const updateAppearance = useCallback(
    (patch: Partial<AppearanceSettings>) => {
      save({ ...settings, appearance: { ...settings.appearance, ...patch } });
    },
    [settings, save]
  );

  const updateProfile = useCallback(
    (patch: Partial<ProfileSettings>) => {
      save({ ...settings, profile: { ...settings.profile, ...patch } });
    },
    [settings, save]
  );

  const toggleNotification = useCallback(
    (key: keyof NotificationSettings) => {
      const val = settings.notifications[key];
      if (typeof val === "boolean") {
        updateNotifications({ [key]: !val });
      }
    },
    [settings.notifications, updateNotifications]
  );

  const setTheme = useCallback(
    (theme: Theme) => updateAppearance({ theme }),
    [updateAppearance]
  );

  const setDensity = useCallback(
    (density: Density) => updateAppearance({ density }),
    [updateAppearance]
  );

  const setLanguage = useCallback(
    (language: Language) => updateAppearance({ language }),
    [updateAppearance]
  );

  const setEmailFrequency = useCallback(
    (emailReportFrequency: EmailReportFrequency) =>
      updateNotifications({ emailReportFrequency }),
    [updateNotifications]
  );

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      updateNotifications,
      updateAppearance,
      updateProfile,
      toggleNotification,
      setTheme,
      setDensity,
      setLanguage,
      setEmailFrequency,
    }),
    [
      settings,
      isLoading,
      updateNotifications,
      updateAppearance,
      updateProfile,
      toggleNotification,
      setTheme,
      setDensity,
      setLanguage,
      setEmailFrequency,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
