"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/table/data-table"
import { Transaction } from "@/app/types"

interface TransactionsDataTableProps {
  data: Transaction[]
  columns: ColumnDef<Transaction>[]
}

export function TransactionsDataTable({ data, columns }: TransactionsDataTableProps) {
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(data.map(item => item.category)))
      .filter((category): category is string => category !== undefined && category !== null)
    
    return uniqueCategories.map(category => ({
      label: category,
      value: category,
    }))
  }, [data])

  const filterableColumns = [
    {
      id: "type",
      title: "Type",
      options: [
        { label: "Income", value: "income" },
        { label: "Expense", value: "expense" },
      ],
    },
    {
      id: "category",
      title: "Category",
      options: categories,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      filterableColumns={filterableColumns}
      searchPlaceholder="Search transactions..."
    />
  )
} 