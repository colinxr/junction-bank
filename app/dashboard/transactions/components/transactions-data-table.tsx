"use client"

import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/layout/data-table"
import { Transaction } from "@/app/types"
import { ResourceDrawer } from "@/components/layout/resource-drawer"
import { TransactionDrawerContent } from "./transaction-drawer-content"

interface TransactionsDataTableProps {
  data: Transaction[]
  columns: ColumnDef<Transaction>[]
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string | number) => void
}

export function TransactionsDataTable({ 
  data, 
  columns,
  onEdit,
  onDelete
}: TransactionsDataTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(data.map(item => item.category)))
      .filter((category): category is string => category !== undefined && category !== null)
    
    return uniqueCategories.map((category, i) => ({
      label: category,
      value: `${category}-${i}`,
    }))
  }, [data])

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
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
        searchPlaceholder="Search transactions..."
        onRowClick={handleRowClick}
        resourceType="transaction"
      />

      {selectedTransaction && (
        <ResourceDrawer
          resource={selectedTransaction}
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          onEdit={onEdit}
          onDelete={onDelete}
          renderContent={(transaction) => (
            <TransactionDrawerContent 
              resource={transaction} 
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
          title="Transaction Details"
        />
      )}
    </>
  )
} 