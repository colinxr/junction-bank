import { TransactionsDataTable } from "./components/transactions-data-table";
import { columns } from "./components/transactions-columns";
import { NewTransactionModal } from "./components/new-transaction-modal";
import { mockTransactions } from "./data/mock-transactions";

export default async function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <NewTransactionModal />
      </div>

      <TransactionsDataTable columns={columns} data={mockTransactions} />
    </div>
  );
} 