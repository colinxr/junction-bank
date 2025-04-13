"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/layout/DataTable"
import { Transaction } from "@/app/types"
import { ResourceDrawer } from "@/components/layout/ResourceDrawer"
import { TransactionDrawerContent } from "./TransactionDrawerContent"
import { useTransactions } from "@/app/hooks/useTransactions"
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

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
  }

  // // Get unique categories for filtering
  // const categories = useMemo(() => {
  //   const uniqueCategories = Array.from(new Set(data.map(item => item.categoryName))).filter(Boolean) // Filter out undefined values
  //   return uniqueCategories
  //     .sort()
  //     .map(category => ({
  //       label: category as string, // Cast to string to ensure it's defined
  //       value: category as string, // Cast to string to ensure it's defined
  //     }))
  // }, [data])

  // const filterableColumns = [
  //   {
  //     id: "category",
  //     title: "Category",
  //     options: categories,
  //   },
  // ]

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        // filterableColumns={filterableColumns}
        searchPlaceholder="Search transactions..."
        onRowClick={handleRowClick}
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