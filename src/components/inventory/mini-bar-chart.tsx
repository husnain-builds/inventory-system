"use client";

import { useState } from "react";

interface MiniBarChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
}

export function MiniBarChart({
  data,
  labels,
  color = "#4f46e5",
  height = 80,
}: MiniBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const max = Math.max(...data, 1);

  return (
    <div className="relative" style={{ height }}>
      {hoveredIndex !== null && labels?.[hoveredIndex] && (
        <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-border bg-surface-elevated px-2.5 py-1 shadow-md">
          <p className="whitespace-nowrap text-[10px] font-bold text-accent-primary">
            {labels[hoveredIndex]}: {data[hoveredIndex]}
          </p>
        </div>
      )}
      <div className="flex h-full items-end gap-1.5">
        {data.map((value, i) => {
          const isHovered = hoveredIndex === i;
          const isDimmed = hoveredIndex !== null && !isHovered;

          return (
            <button
              key={i}
              type="button"
              className="group relative flex-1 rounded-md transition-all duration-200 focus:outline-none"
              style={{
                height: `${Math.max((value / max) * 100, 12)}%`,
                backgroundColor: color,
                opacity: isDimmed ? 0.3 : isHovered ? 1 : 0.55 + (i / data.length) * 0.4,
                transform: isHovered ? "scaleY(1.06) scaleX(1.08)" : "scaleY(1)",
                transformOrigin: "bottom",
                boxShadow: isHovered
                  ? `0 4px 12px ${color}55`
                  : "none",
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              aria-label={labels?.[i] ? `${labels[i]}: ${value}` : `${value}`}
            />
          );
        })}
      </div>
    </div>
  );
}
