'use client';

import { TransactionsDataTable } from "./components/transactions-data-table";
import { columns } from "./components/transactions-columns";
import { NewTransactionModal } from "./components/new-transaction-modal";
import { Suspense, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/app/hooks/useTransactions";
import { Transaction } from "@/app/types";
import { toast } from "sonner";

function TransactionsContent() {
  // Use our custom hook instead of direct SWR usage
  const {
    transactions,
    isLoading,
    error,
    refresh,
  } = useTransactions();

  // Edit handler for transaction
  const handleEdit = (transaction: Transaction) => {
    // This could open an edit modal or navigate to an edit page
    // For now, we'll just show a toast notification
    toast.success(`Editing transaction: ${transaction.name}`);
    
    // In a real implementation, you would:
    // 1. Open edit modal or navigate to edit page
    // 2. Handle the update API call
    // 3. Refresh the data with refresh()
  };

  // Delete handler for transaction
  const handleDelete = async (id: string | number) => {
    try {
      // Mock deletion for now
      toast.success(`Deleting transaction ID: ${id}`);
      
      // In a real implementation, you would:
      // 1. Call your API to delete the transaction
      // 2. Refresh the data with refresh()
      // await deleteTransaction(id);
      // await refresh();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction. Please try again.");
    }
  };

  if (error) {
    return <div className="p-8 text-center">Failed to load transactions. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <NewTransactionModal />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <TransactionsDataTable 
          columns={columns} 
          data={transactions} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    }>
      <TransactionsContent />
    </Suspense>
  );
} 