"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import {
  AuthFormShell,
  AuthFooterLink,
  authInputClass,
} from "@/components/auth/auth-form-shell";
import { DemoCredentialsModal } from "@/components/auth/demo-credentials-modal";

export default function SignUpPage() {
  const router = useRouter();
  const { user, isLoading, signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await signUp(name, email, password);
    if (result.error) setError(result.error);

    setSubmitting(false);
  }

  function handleUseCredential(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setShowDemoModal(false);
    setError("");
  }

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <AuthFormShell
        title="Create account"
        subtitle="Get started with StockFlow today"
        footer={
          <AuthFooterLink
            text="Already have an account?"
            linkText="Sign in"
            href="/sign-in"
          />
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-accent-danger/20 bg-accent-danger-light px-4 py-3 text-sm text-accent-danger">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Elena Liu"
              required
              className={authInputClass}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className={authInputClass}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className={`${authInputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-secondary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-primary/90 disabled:opacity-60 glow-primary"
          >
            <UserPlus className="h-4 w-4" />
            {submitting ? "Creating account..." : "Create Account"}
          </button>

          <button
            type="button"
            onClick={() => setShowDemoModal(true)}
            className="w-full text-center text-sm font-medium text-accent-primary transition-colors hover:text-accent-primary/80"
          >
            Demo Credentials
          </button>
        </form>
      </AuthFormShell>

      <DemoCredentialsModal
        open={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onUseCredential={handleUseCredential}
      />
    </>
  );
}
