"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Category } from "@/lib/repositories/category.repository"

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.name
      
      return (
        <div className="max-w-[200px] truncate" title={name}>
          {name}
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type
      
      return (
        <div className="capitalize">
          {type}
        </div>
      )
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.original.notes
      
      return notes ? (
        <div className="max-w-[300px] truncate" title={notes}>
          {notes}
        </div>
      ) : (
        <div className="text-gray-400">-</div>
      )
    },
  },
] 