"use client"

import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/layout/data-table"
import { MonthData, Month } from "@/app/types"
import { ResourceDrawer } from "@/components/layout/resource-drawer"
import { MonthDrawerContent } from "./MonthDrawerContent"
import { useMonths } from "@/app/hooks/useMonths"

interface MonthsDataTableProps {
  data: MonthData[]
  columns: ColumnDef<MonthData>[]
}

export function MonthsDataTable({ data, columns }: MonthsDataTableProps) {
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { editMonth, deleteMonth } = useMonths()

  const handleRowClick = (month: MonthData) => {
    setSelectedMonth(month)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
  }

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
    <>
      <DataTable
        columns={columns}
        data={data}
        filterableColumns={filterableColumns}
        searchPlaceholder="Search months..."
        onRowClick={handleRowClick}
        resourceType="month"
      />
      
      {selectedMonth && (
        <ResourceDrawer
          resource={selectedMonth}
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          onEdit={(month) => {
            // Convert MonthData to Month type
            const monthObj: Month = {
              id: 0, // We don't have an id in MonthData, this needs proper handling
              name: month.month,
              year: month.year,
              notes: month.notes
            };
            editMonth(monthObj);
          }}
          onDelete={deleteMonth}
          renderContent={(month) => <MonthDrawerContent resource={month} />}
          title="Month Details"
        />
      )}
    </>
  )
} 