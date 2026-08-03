import { getUserByEmail, type UserRole } from "@/lib/mock-data";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  department?: string;
}

export interface DemoCredential {
  label: string;
  email: string;
  password: string;
  role: string;
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    label: "Admin",
    email: "admin@stockflow.io",
    password: "admin123456",
    role: "View all users & inventory",
  },
  {
    label: "Warehouse User",
    email: "elena@stockflow.io",
    password: "user123456",
    role: "Manage own inventory",
  },
];

const SESSION_KEY = "stockflow_session";
const USERS_KEY = "stockflow_users";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getStoredUsers(): Record<string, { name: string; password: string }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveStoredUsers(
  users: Record<string, { name: string; password: string }>
) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

function buildUserFromDemo(email: string, cred: DemoCredential): User {
  const mockUser = getUserByEmail(email);
  return {
    id: mockUser?.id ?? `demo-${email}`,
    name: mockUser?.name ?? cred.label,
    email,
    avatar: getInitials(mockUser?.name ?? cred.label),
    role: email.startsWith("admin") ? "admin" : "user",
    department: mockUser?.department,
  };
}

export function signIn(
  email: string,
  password: string
): { user: User } | { error: string } {
  const normalizedEmail = email.trim().toLowerCase();

  const demoMatch = DEMO_CREDENTIALS.find(
    (cred) => cred.email === normalizedEmail && cred.password === password
  );

  if (demoMatch) {
    const user = buildUserFromDemo(normalizedEmail, demoMatch);
    setSession(user);
    return { user };
  }

  const stored = getStoredUsers()[normalizedEmail];
  if (stored && stored.password === password) {
    const user: User = {
      id: `user-${normalizedEmail}`,
      name: stored.name,
      email: normalizedEmail,
      avatar: getInitials(stored.name),
      role: "user",
    };
    setSession(user);
    return { user };
  }

  return { error: "Invalid email or password. Try the demo credentials." };
}

export function signUp(
  name: string,
  email: string,
  password: string
): { user: User } | { error: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedName) return { error: "Name is required." };
  if (password.length < 6)
    return { error: "Password must be at least 6 characters." };

  const isDemoEmail = DEMO_CREDENTIALS.some(
    (cred) => cred.email === normalizedEmail
  );
  if (isDemoEmail) {
    return {
      error: "This email is reserved for demo accounts. Use Sign In instead.",
    };
  }

  const users = getStoredUsers();
  if (users[normalizedEmail]) {
    return { error: "An account with this email already exists." };
  }

  users[normalizedEmail] = { name: trimmedName, password };
  saveStoredUsers(users);

  const user: User = {
    id: `user-${normalizedEmail}`,
    name: trimmedName,
    email: normalizedEmail,
    avatar: getInitials(trimmedName),
    role: "user",
  };
  setSession(user);
  return { user };
}
