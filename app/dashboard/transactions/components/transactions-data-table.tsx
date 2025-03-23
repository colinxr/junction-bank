"use client"

import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/layout/data-table"
import { Transaction } from "@/app/types"
import { ResourceDrawer } from "@/components/layout/resource-drawer"
import { TransactionDrawerContent } from "./transaction-drawer-content"
import { useTransactions } from "@/app/hooks/useTransactions"

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
          onEdit={editTransaction}
          onDelete={deleteTransaction}
          renderContent={(transaction) => <TransactionDrawerContent resource={transaction} />}
          title="Transaction Details"
        />
      )}
    </>
  )
} 