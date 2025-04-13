"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {  formatDate } from "@/lib/utils"
import { Transaction } from "@/app/types"

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "name",
    header: "Description",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="pl-0"
      >
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="pl-0"
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue("date")),
    sortingFn: "datetime"
  },
  {
    accessorKey: "amountCAD",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="pl-0"
      >
        Amount (CAD)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amountCAD"));
      const formatted = new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
      }).format(amount);
      
      return (
        <div className={`text-center ${row.original.type === 'INCOME' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}>
          {formatted}
        </div>
      )
    },
  },
  {
    accessorKey: "amountUSD",
    header: "Amount (USD)",
    cell: ({ row }) => {
      if (!row.original.amountUSD) return '-';
      const amount = parseFloat(row.getValue("amountUSD"));
      const formatted = new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      
      return (
        <div className={`text-center ${row.original.type === 'INCOME' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}>
          {formatted}
        </div>
      )
    },
  },
  {
    id: "notes",
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.original.notes
      return notes ? (
        <div className="max-w-[200px] truncate" title={notes}>
          {notes}
        </div>
      ) : (
        <div className="text-gray-400">-</div>
      )
    },
  },
] 