import { TransactionsDataTable } from "./transactions-data-table";
import { columns } from "./transactions-columns";
import { NewTransactionModal } from "./new-transaction-modal";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/app/hooks/useTransactions";
import { Month } from "@/app/types";

export function TransactionsContent({ month }: { month?: Month }) {
  // Use our custom hook instead of direct SWR usage
  const {
    transactions,
    isLoading,
    error,
    refresh,
  } = useTransactions({ monthId: month?.id });

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
        />
      )}
    </div>
  );
}