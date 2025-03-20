"use client"

import { ColumnDef } from "@tanstack/react-table"

interface MonthData {
  month: string
  year: number
  revenue: number
  expenses: number
  profit: number
  transactionCount: number
}

export const columns: ColumnDef<MonthData>[] = [
  {
    accessorKey: "month",
    header: "Month",
  },
  {
    accessorKey: "year",
    header: "Year",
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("revenue"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return formatted
    },
  },
  {
    accessorKey: "expenses",
    header: "Expenses",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("expenses"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return formatted
    },
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("profit"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <span className={amount >= 0 ? "text-green-600" : "text-red-600"}>{formatted}</span>
    },
  },
  {
    accessorKey: "transactionCount",
    header: "Transactions",
  },
] 
