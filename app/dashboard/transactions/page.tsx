"use client";

import { TransactionsDataTable } from "./components/transactions-data-table";
import { columns } from "./components/transactions-columns";
import { mockTransactions } from "./data/mock-transactions";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
      </div>
      <TransactionsDataTable columns={columns} data={mockTransactions} />
    </div>
  );
} 