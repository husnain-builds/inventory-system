"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartTooltip } from "./chart-tooltip";

interface CategoryBarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  layout?: "vertical" | "horizontal";
}

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#059669", "#0891b2"];

function HorizontalCategoryBars({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ul className="flex flex-col gap-3">
      {data.map((item, index) => {
        const isActive = activeIndex === null || activeIndex === index;
        const color = COLORS[index % COLORS.length];

        return (
          <li
            key={item.label}
            className="rounded-xl px-1 py-0.5 transition-opacity"
            style={{ opacity: isActive ? 1 : 0.45 }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="truncate text-xs font-medium text-text-secondary">
                {item.label}
              </span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-text-primary">
                {item.value}
                <span className="ml-0.5 font-normal text-text-muted">items</span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: color,
                  filter:
                    activeIndex === index
                      ? "drop-shadow(0 1px 4px rgba(79,70,229,0.35))"
                      : "none",
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function CategoryBarChart({
  data,
  height,
  layout = "vertical",
}: CategoryBarChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (layout === "horizontal") {
    return <HorizontalCategoryBars data={data} />;
  }

  const computedHeight =
    height ?? Math.max(200, data.length * 40 + 80);

  return (
    <div className="w-full" style={{ height: computedHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 8, left: -16, bottom: 32 }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={56}
          />
          <YAxis hide domain={[0, "dataMax + 1"]} />
          <Tooltip
            content={<ChartTooltip suffix=" items" />}
            cursor={{ fill: "rgba(79, 70, 229, 0.06)", radius: 8 }}
          />
          <Bar
            dataKey="value"
            radius={[6, 6, 2, 2]}
            maxBarSize={40}
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
                style={{
                  transition: "all 0.2s ease",
                  opacity: activeIndex === null || activeIndex === index ? 1 : 0.35,
                  filter:
                    activeIndex === index
                      ? "drop-shadow(0 3px 6px rgba(79,70,229,0.3))"
                      : "none",
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
