"use client"

import { useState } from "react"
import { ColumnDef, SortingState } from "@tanstack/react-table"
import { DataTable } from "@/components/layout/DataTable"
import { Transaction } from "@/app/types"
import { ResourceDrawer } from "@/components/layout/ResourceDrawer"
import { TransactionDrawerContent } from "./TransactionDrawerContent"
import { useTransactions } from "@/app/hooks/useTransactions"
import { useCategories } from "@/app/hooks/useCategories"
import { EditTransactionModal } from "./EditTransactionModal"

interface TransactionsDataTableProps {
  data: Transaction[]
  columns: ColumnDef<Transaction>[]
}

export function TransactionsDataTable({ 
  data, 
  columns,
}: TransactionsDataTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { editTransaction, deleteTransaction } = useTransactions()
  const { categories } = useCategories()

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
  }

  const filterableColumns = [
    {
      id: "categoryName",
      title: "Category",
      options: categories,
    },
  ]

  // Set the initial sorting to date in descending order
  const initialSorting: SortingState = [
    { id: "date", desc: true }
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        filterableColumns={filterableColumns}
        searchPlaceholder="Search transactions..."
        onRowClick={handleRowClick}
        initialSorting={initialSorting}
      />

      {selectedTransaction && (
        <ResourceDrawer
          resource={selectedTransaction}
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          onEdit={editTransaction}
          onDelete={deleteTransaction}
          renderContent={(transaction) => <TransactionDrawerContent resource={transaction} />}
          title="Transaction Details"
          EditModal={EditTransactionModal}
        />  
      )}
    </>
  )
} 