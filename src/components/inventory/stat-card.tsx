import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "warning" | "success" | "info";
}

const variantStyles = {
  default: {
    icon: "bg-accent-primary-light text-accent-primary group-hover:bg-accent-primary group-hover:text-white",
    accent: "from-accent-primary/5 to-transparent",
  },
  warning: {
    icon: "bg-accent-warning-light text-accent-warning group-hover:bg-accent-warning group-hover:text-white",
    accent: "from-accent-warning/5 to-transparent",
  },
  success: {
    icon: "bg-accent-success-light text-accent-success group-hover:bg-accent-success group-hover:text-white",
    accent: "from-accent-success/5 to-transparent",
  },
  info: {
    icon: "bg-accent-info-light text-accent-info group-hover:bg-accent-info group-hover:text-white",
    accent: "from-accent-info/5 to-transparent",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="group glass-card relative overflow-hidden rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${styles.accent} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
      />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${styles.icon}`}
          >
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          {value}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-text-secondary">
          {label}
        </p>
        {trend && (
          <p className="mt-1.5 text-xs text-text-muted">{trend}</p>
        )}
      </div>
    </div>
  );
}
