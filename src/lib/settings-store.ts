export type Theme = "light" | "dark";
export type Density = "comfortable" | "compact";
export type Language = "english" | "spanish" | "french";
export type EmailReportFrequency = "daily" | "weekly" | "monthly" | "off";

export interface NotificationSettings {
  lowStockAlerts: boolean;
  emailReports: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  emailReportFrequency: EmailReportFrequency;
}

export interface AppearanceSettings {
  theme: Theme;
  density: Density;
  language: Language;
}

export interface ProfileSettings {
  displayName: string;
  department: string;
}

export interface AppSettings {
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  profile: ProfileSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    lowStockAlerts: true,
    emailReports: true,
    pushNotifications: true,
    weeklyDigest: false,
    emailReportFrequency: "weekly",
  },
  appearance: {
    theme: "light",
    density: "comfortable",
    language: "english",
  },
  profile: {
    displayName: "",
    department: "",
  },
};

const SETTINGS_KEY = "stockflow_settings";

export function getSettingsForUser(email: string): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const all = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") as Record<
      string,
      AppSettings
    >;
    const stored = all[email.toLowerCase()];
    if (!stored) return DEFAULT_SETTINGS;
    return {
      notifications: { ...DEFAULT_SETTINGS.notifications, ...stored.notifications },
      appearance: { ...DEFAULT_SETTINGS.appearance, ...stored.appearance },
      profile: { ...DEFAULT_SETTINGS.profile, ...stored.profile },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsForUser(email: string, settings: AppSettings) {
  if (typeof window === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") as Record<
      string,
      AppSettings
    >;
    all[email.toLowerCase()] = settings;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  english: "English",
  spanish: "Español",
  french: "Français",
};

export const DENSITY_LABELS: Record<Density, string> = {
  comfortable: "Comfortable",
  compact: "Compact",
};

export const THEME_LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
};

export const FREQUENCY_LABELS: Record<EmailReportFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  off: "Off",
};
