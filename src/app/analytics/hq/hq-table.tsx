"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { HQAggregation } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

const columns: ColumnDef<HQAggregation>[] = [
  {
    accessorKey: "hqCode",
    header: "HQ Code",
  },
  {
    accessorKey: "hqName",
    header: "HQ Name",
  },
  {
    accessorKey: "totalTarget",
    header: "Target",
    cell: ({ row }) => formatCurrency(row.getValue("totalTarget")),
  },
  {
    accessorKey: "totalSales",
    header: "Sales",
    cell: ({ row }) => formatCurrency(row.getValue("totalSales")),
  },
  {
    accessorKey: "totalNetSales",
    header: "Net Sales",
    cell: ({ row }) => formatCurrency(row.getValue("totalNetSales")),
  },
  {
    accessorKey: "achievement",
    header: "Achievement",
    cell: ({ row }) => {
      const value = row.getValue("achievement") as number;
      return (
        <Badge
          variant={
            value >= 100 ? "success" : value >= 80 ? "warning" : "destructive"
          }
        >
          {formatPercent(value)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "recordCount",
    header: "Records",
  },
];

interface Props {
  data: HQAggregation[];
}

export function HQsTable({ data }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="hqName"
      searchPlaceholder="Search by HQ name..."
    />
  );
}
