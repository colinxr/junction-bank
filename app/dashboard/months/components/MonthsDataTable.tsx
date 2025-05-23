"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/layout/DataTable"
import { Month } from "@/app/types"
import { ResourceDrawer } from "@/components/layout/ResourceDrawer"
import { MonthDrawerContent } from "./MonthDrawerContent"
import { useMonths } from "@/app/hooks/useMonths"

interface MonthsDataTableProps {
  data: Month[]
  columns: ColumnDef<Month>[]
}

export function MonthsDataTable({ data, columns }: MonthsDataTableProps) {
  const [selectedMonth, setSelectedMonth] = useState<Month | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { editMonth, deleteMonth } = useMonths()

  const handleRowClick = (month: Month) => {
    setSelectedMonth(month)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
  }
  
  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search months..."
        onRowClick={handleRowClick}
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
              month: month.month,
              year: month.year,
              notes: month.notes
            };
            editMonth(monthObj);
          }}
          onDelete={deleteMonth}
          renderContent={(month) => <MonthDrawerContent resource={month} />}
          title="Month Details"
          className="!w-[90%] !max-w-none"
        />
      )}
    </>
  )
} 