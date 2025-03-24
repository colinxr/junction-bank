import { RecurringTransactionsDataTable } from "./RecurringTransactionsDataTable";
import { columns } from "./RecurringTransactionColumns";
import { NewRecurringTransactionModal } from "./NewRecurringTransactionModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecurringTransactions } from "@/app/hooks/useRecurringTransactions";

export function RecurringTransactionsContent() {
  // Use our custom hook for recurring transactions
  const {
    recurringTransactions,
    isLoading,
    error,
    refresh,
  } = useRecurringTransactions();

  if (error) {
    return <div className="p-8 text-center">Failed to load recurring transactions. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recurring Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Templates that automatically create transactions when a new month is created
          </p>
        </div>
        <NewRecurringTransactionModal />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <RecurringTransactionsDataTable 
          columns={columns} 
          data={recurringTransactions} 
        />
      )}
    </div>
  );
} 