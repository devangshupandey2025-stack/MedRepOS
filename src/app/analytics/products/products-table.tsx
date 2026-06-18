"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { ProductAggregation } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

const columns: ColumnDef<ProductAggregation>[] = [
  {
    accessorKey: "materialCode",
    header: "Material Code",
  },
  {
    accessorKey: "materialName",
    header: "Product Name",
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
  data: ProductAggregation[];
}

export function ProductsTable({ data }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="materialName"
      searchPlaceholder="Search by product name..."
    />
  );
}
