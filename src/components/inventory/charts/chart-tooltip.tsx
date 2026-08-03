"use client";

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { label: string } }[];
  label?: string;
  suffix?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  suffix = "",
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const value = payload[0].value;
  const displayLabel = label ?? payload[0].payload?.label;

  return (
    <div className="rounded-xl border border-border bg-surface-elevated px-3 py-2 shadow-lg ring-1 ring-black/5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {displayLabel}
      </p>
      <p className="text-base font-bold text-accent-primary">
        {value.toLocaleString()}
        {suffix}
      </p>
    </div>
  );
}
