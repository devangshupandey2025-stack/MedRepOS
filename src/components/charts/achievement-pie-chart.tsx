"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { AchievementDistribution } from "@/types";

interface Props {
  data: AchievementDistribution;
}

const COLORS = {
  above100: "#22C55E",
  between80And100: "#F59E0B",
  below80: "#EF4444",
};

export function AchievementPieChart({ data }: Props) {
  const chartData = [
    {
      name: "Above 100%",
      value: data.above100,
      color: COLORS.above100,
    },
    {
      name: "80-100%",
      value: data.between80And100,
      color: COLORS.between80And100,
    },
    {
      name: "Below 80%",
      value: data.below80,
      color: COLORS.below80,
    },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1F2937",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
          />
          <Legend
            wrapperStyle={{ color: "#9CA3AF", fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
