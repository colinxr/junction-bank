"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Transaction } from "@/app/types"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Transaction>[] = [
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
    accessorKey: "name",
    header: "Description",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div>{row.original.category}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "amount_cad",
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
      const amount = parseFloat(row.getValue("amount_cad"))
      const type = row.original.type
      
      return (
        <div className={type === "income" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
          {type === "income" ? "+" : "-"}
          {formatCurrency(amount)}
        </div>
      )
    },
  },
  {
    accessorKey: "amount_usd",
    header: "Amount (USD)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount_usd"))
      const type = row.original.type
      
      return (
        <div className={type === "income" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
          {type === "income" ? "+" : "-"}
          {formatCurrency(amount)}
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant={type === "income" ? "default" : "destructive"}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
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