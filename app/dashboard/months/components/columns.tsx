"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Month } from "@/app/types"

export const columns: ColumnDef<Month>[] = [
  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => {
      const month = Number(row.original.month)

      return month ? (
        <div className="max-w-[200px] truncate" title={month.toString()}>
          {month}
        </div>
      ) : (
        <div className="text-gray-400">-</div>
      )
    },
  },
  {
    accessorKey: "year",
    header: "Year",
  },
  {
    accessorKey: "notes",
    header: "Notes",
  },
  {
    accessorKey: "transactionCount",
    header: "Transactions",
  },
] 
