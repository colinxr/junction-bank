"use client"

import { ColumnDef } from "@tanstack/react-table"

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
