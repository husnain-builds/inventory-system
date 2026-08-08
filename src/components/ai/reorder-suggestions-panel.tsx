"use client";

import Link from "next/link";
import { ArrowUpRight, PackagePlus, Sparkles } from "lucide-react";
import type { ReorderSuggestion } from "@/lib/ai/reorder-suggestions";

const priorityStyles = {
  critical: "bg-accent-danger-light text-accent-danger ring-accent-danger/20",
  high: "bg-accent-warning-light text-accent-warning ring-accent-warning/20",
  medium: "bg-accent-info-light text-accent-info ring-accent-info/20",
};

const priorityLabels = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
};

interface ReorderSuggestionsPanelProps {
  suggestions: ReorderSuggestion[];
  admin?: boolean;
}

export function ReorderSuggestionsPanel({
  suggestions,
  admin = false,
}: ReorderSuggestionsPanelProps) {
  if (suggestions.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-primary" />
          <h3 className="text-sm font-bold text-text-primary">
            Smart Reorder Suggestions
          </h3>
        </div>
        <p className="text-sm text-text-muted">
          All items are above minimum stock. No reorders suggested right now.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card glass-card-glow rounded-xl p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-primary" />
            <h3 className="text-sm font-bold text-text-primary">
              Smart Reorder Suggestions
            </h3>
          </div>
          <p className="text-[10px] text-text-muted">
            AI-ranked by urgency, stock level, and recent usage
          </p>
        </div>
        <Link
          href="/inventory"
          className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent-primary transition-colors hover:bg-accent-primary-light"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <ul className="space-y-3">
        {suggestions.slice(0, 4).map((s) => (
          <li
            key={s.itemId}
            className="rounded-xl border border-border bg-surface px-3 py-3 transition-colors hover:border-accent-primary/20"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {s.itemName}
                </p>
                <p className="text-[10px] text-text-muted">
                  {s.sku} · {s.location}
                  {admin && s.ownerName ? ` · ${s.ownerName}` : ""}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${priorityStyles[s.priority]}`}
              >
                {priorityLabels[s.priority]}
              </span>
            </div>

            <p className="mb-2 text-xs leading-relaxed text-text-secondary">
              {s.reason}
            </p>

            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-text-muted">
                {s.currentQty}/{s.minStock} {s.unit}
                {s.daysUntilEmpty != null && s.daysUntilEmpty > 0
                  ? ` · ~${s.daysUntilEmpty}d left`
                  : ""}
              </p>
              <div className="flex items-center gap-1.5 rounded-lg bg-accent-primary-light px-2.5 py-1 text-[11px] font-semibold text-accent-primary">
                <PackagePlus className="h-3.5 w-3.5" />
                Reorder +{s.suggestedQty} {s.unit}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
