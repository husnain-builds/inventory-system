import { Package } from "lucide-react";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-primary shadow-sm glow-primary">
        <Package className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
      </div>
      {!compact && (
        <div>
          <span className="text-base font-bold tracking-tight text-text-primary">
            StockFlow
          </span>
          <p className="text-[10px] font-medium text-text-muted">
            Inventory System
          </p>
        </div>
      )}
    </div>
  );
}
