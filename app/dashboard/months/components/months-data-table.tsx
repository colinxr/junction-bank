"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/layout/data-table"
import { MonthData } from "@/app/types"

interface MonthsDataTableProps {
  data: MonthData[]
  columns: ColumnDef<MonthData>[]
}

export function MonthsDataTable({ data, columns }: MonthsDataTableProps) {

  // Get unique years for filtering
  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(data.map(item => item.year)))
    return uniqueYears
      .sort((a, b) => b - a)
      .map(year => ({
        label: year.toString(),
        value: year.toString(),
      }))
  }, [data])

  const filterableColumns = [
    {
      id: "year",
      title: "Year",
      options: years,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      filterableColumns={filterableColumns}
      searchPlaceholder="Search months..."
    />
  )
} 