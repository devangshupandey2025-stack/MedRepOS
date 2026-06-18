"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ProductAggregation } from "@/types";

interface Props {
  data: ProductAggregation[];
}

export function ProductPerformanceChart({ data }: Props) {
  const chartData = data.slice(0, 10).map((p) => ({
    name: p.materialName.length > 15 ? p.materialName.slice(0, 15) + "..." : p.materialName,
    sales: Math.round(p.totalSales / 1000),
    target: Math.round(p.totalTarget / 1000),
  }));

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            dataKey="name"
            stroke="#9CA3AF"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: "#9CA3AF" }}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={11}
            tick={{ fill: "#9CA3AF" }}
            label={{
              value: "Amount (K)",
              angle: -90,
              position: "insideLeft",
              fill: "#9CA3AF",
              fontSize: 11,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1F2937",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
            formatter={(value: number) => [`₹${value}K`, undefined]}
          />
          <Bar
            dataKey="sales"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
            name="Sales"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
