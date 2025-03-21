import { TransactionsDataTable } from "./components/transactions-data-table";
import { TransactionRepository } from "@/lib/repositories/transaction.repository";
import { columns } from "./components/transactions-columns";
import { NewTransactionModal } from "./components/new-transaction-modal";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Transaction } from "@/app/types";

export default async function TransactionsPage() {
  // Get the session server-side
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect if not authenticated
  if (!session) {
    redirect('/login'); // Or wherever your login page is
  }
  
  // Now fetch transactions
  let transactions: Transaction[] = [];
  try {
    const response = await TransactionRepository.getTransactions();
    
    transactions = response.data || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <NewTransactionModal />
      </div>

      <TransactionsDataTable columns={columns} data={transactions} />
    </div>
  );
} 