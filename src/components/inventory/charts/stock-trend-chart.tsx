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

interface StockTrendChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export function StockTrendChart({ data, height = 220 }: StockTrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            width={36}
          />
          <Tooltip
            content={<ChartTooltip suffix=" units" />}
            cursor={{ fill: "rgba(79, 70, 229, 0.06)", radius: 8 }}
          />
          <Bar
            dataKey="value"
            radius={[8, 8, 4, 4]}
            maxBarSize={48}
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={
                  activeIndex === index
                    ? "#4338ca"
                    : activeIndex === null
                      ? "#4f46e5"
                      : "#c7d2fe"
                }
                style={{
                  transition: "fill 0.2s ease, filter 0.2s ease",
                  filter:
                    activeIndex === index
                      ? "drop-shadow(0 4px 8px rgba(79,70,229,0.35))"
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
