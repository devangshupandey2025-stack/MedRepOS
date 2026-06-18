"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { HQAggregation } from "@/types";

interface Props {
  data: HQAggregation[];
}

const COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

export function HQRankingChart({ data }: Props) {
  const chartData = [...data]
    .sort((a, b) => b.achievement - a.achievement)
    .slice(0, 10)
    .map((h) => ({
      name: h.hqName.length > 15 ? h.hqName.slice(0, 15) + "..." : h.hqName,
      achievement: Math.round(h.achievement * 10) / 10,
    }));

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            type="number"
            stroke="#9CA3AF"
            fontSize={11}
            tick={{ fill: "#9CA3AF" }}
            unit="%"
          />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#9CA3AF"
            fontSize={11}
            tick={{ fill: "#9CA3AF" }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1F2937",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
            formatter={(value: number) => [`${value}%`, "Achievement"]}
          />
          <Bar dataKey="achievement" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
