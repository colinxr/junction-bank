export interface Transaction {
  id: number
  user_id: string
  month_id: number
  name: string
  amount_cad: number
  amount_usd: number | null
  category_id: number
  notes: string | null
  date: Date
  type: 'Income' | 'Expense'
  created_at: string
  category?: string
}

export interface Month {
  id: number
  month: string
  year: number
  notes: string | null
  transactionCount?: number
  cashflow?: number
  totalIncome?: number
  totalExpenses?: number
} 

// Define our recurring transaction type
export interface RecurringTransaction {
  id: number;
  name: string;
  type: "Income" | "Expense";
  amount_cad: number;
  amount_usd?: number;
  day_of_month?: number;
  notes?: string;
  categoryId: number;
  category?: string;
  createdAt: Date;
}