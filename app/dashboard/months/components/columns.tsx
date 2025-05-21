"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Month } from "@/app/types"
import { formatCurrency, getMonthName } from "@/infrastructure/utils"

export const columns: ColumnDef<Month>[] = [
  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => {
      const month = Number(row.original.month)

      return month ? (
        <div className="max-w-[200px] truncate" title={month.toString()}>
          {getMonthName(month) + " " + row.original.year}
        </div>
      ) : (
        <div className="text-gray-400">-</div>
      )
    },
  },
  {
    accessorKey: "totalIncome ",
    header: "Income",
    cell: ({ row }) => {
      const totalIncome = row.original.totalIncome
      return totalIncome ? formatCurrency(totalIncome) : "-"
    },
  },
  {
    accessorKey: "totalExpenses",
    header: "Expenses",
    cell: ({ row }) => {
      const totalExpenses = row.original.totalExpenses
      return totalExpenses ? formatCurrency(totalExpenses) : "-"
    },
  },
  {
    accessorKey: "totalSavings",
    header: "Savings",
    cell: ({ row }) => {
      const totalIncome = row.original.totalIncome || 0;
      const totalExpenses = row.original.totalExpenses || 0;
      const totalSavings = totalIncome - totalExpenses;
      return formatCurrency(totalSavings);
    },
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
