import Link from "next/link";
import { Logo } from "@/components/ui/logo";

interface AuthFormShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthFormShell({
  title,
  subtitle,
  children,
  footer,
}: AuthFormShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent-primary/8 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-accent-info/8 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="glass-card glass-card-glow rounded-2xl p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        <div className="mt-6 text-center text-sm text-text-secondary">
          {footer}
        </div>
      </div>
    </div>
  );
}

export function AuthFooterLink({
  text,
  linkText,
  href,
}: {
  text: string;
  linkText: string;
  href: string;
}) {
  return (
    <p>
      {text}{" "}
      <Link
        href={href}
        className="font-semibold text-accent-primary transition-colors hover:text-accent-primary/80"
      >
        {linkText}
      </Link>
    </p>
  );
}

export const authInputClass =
  "w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/15";
