"use client";

import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import { DEMO_CREDENTIALS } from "@/lib/auth";

interface DemoCredentialsModalProps {
  open: boolean;
  onClose: () => void;
  onUseCredential: (email: string, password: string) => void;
}

export function DemoCredentialsModal({
  open,
  onClose,
  onUseCredential,
}: DemoCredentialsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!open) return null;

  async function copyToClipboard(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface-elevated p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            Demo Credentials
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-5 text-sm leading-relaxed text-text-secondary">
          Use these accounts to explore the dashboard. Tap &quot;Use Account&quot;
          to auto-fill the form.
        </p>

        <div className="space-y-4">
          {DEMO_CREDENTIALS.map((cred) => (
            <div
              key={cred.email}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {cred.label}
                  </p>
                  <p className="text-xs text-text-muted">{cred.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUseCredential(cred.email, cred.password)}
                  className="rounded-xl bg-accent-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-accent-primary/90"
                >
                  Use Account
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-3 py-2.5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      Email
                    </p>
                    <p className="text-sm font-medium text-text-primary">
                      {cred.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(cred.email, `${cred.email}-email`)
                    }
                    className="text-text-muted transition-colors hover:text-accent-primary"
                    aria-label="Copy email"
                  >
                    {copiedField === `${cred.email}-email` ? (
                      <Check className="h-4 w-4 text-accent-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-3 py-2.5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      Password
                    </p>
                    <p className="font-mono text-sm font-medium text-text-primary">
                      {cred.password}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(cred.password, `${cred.email}-password`)
                    }
                    className="text-text-muted transition-colors hover:text-accent-primary"
                    aria-label="Copy password"
                  >
                    {copiedField === `${cred.email}-password` ? (
                      <Check className="h-4 w-4 text-accent-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
