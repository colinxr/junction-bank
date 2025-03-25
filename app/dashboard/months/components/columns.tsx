"use client"

import { ColumnDef } from "@tanstack/react-table"
import { getMonthName } from "@/lib/utils"
import { Month } from "@/app/types"

export const columns: ColumnDef<Month>[] = [
  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => {
      const month = row.original.month
      const monthNumber = parseInt(month)
      
      return month ? (
        <div className="max-w-[200px] truncate" title={month}>
          {getMonthName(monthNumber)}
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
