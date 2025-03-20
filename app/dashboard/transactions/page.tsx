"use client";

import { useState } from "react";
import { TransactionsDataTable } from "./components/transactions-data-table";
import { columns } from "./components/transactions-columns";
import { mockTransactions } from "./data/mock-transactions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { NewTransactionForm } from "./components/new-transaction-form";

export default function TransactionsPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Transaction</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Add Transaction</DialogTitle>
            <NewTransactionForm 
              onSubmit={(data) => {
                console.log("Submitted data:", data);
                setIsOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <TransactionsDataTable columns={columns} data={mockTransactions} />
    </div>
  );
} 