"use client"

import { ColumnDef } from "@tanstack/react-table"
import { getMonthName } from "@/lib/utils"

interface MonthData {
  month: string
  year: number
  notes: string | null
  transactionCount: number
}

export const columns: ColumnDef<MonthData>[] = [
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
