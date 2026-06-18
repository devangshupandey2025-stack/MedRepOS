"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: { hqName: string; target: number; sales: number }[];
}

export function TargetVsSalesChart({ data }: Props) {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            dataKey="hqName"
            stroke="#9CA3AF"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: "#9CA3AF" }}
          />
          <YAxis stroke="#9CA3AF" fontSize={11} tick={{ fill: "#9CA3AF" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1F2937",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
          />
          <Legend wrapperStyle={{ color: "#9CA3AF" }} />
          <Bar dataKey="target" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Target" />
          <Bar dataKey="sales" fill="#22C55E" radius={[4, 4, 0, 0]} name="Sales" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
