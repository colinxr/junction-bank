import { TransactionType } from '@/domains/Transactions/Transaction';

export interface Transaction {
  id: number
  userId: string
  monthId: number
  name: string
  amountCAD: number
  amountUSD?: number
  categoryId: number
  categoryName: string,
  category?: Category,
  notes?: string,
  date: Date
  type: TransactionType
  createdAt: string
}

// Define our recurring transaction type
export interface RecurringTransaction {
  id: number;
  name: string;
  type?: "Income" | "Expense";
  amountCAD?: number;
  amountUSD?: number;
  dayOfMonth?: number;
  notes?: string;
  categoryId: number; 
  categoryName: string;
  createdAt: Date;
}

export interface Month {
  id: number
  month: number
  year: number
  notes: string | null
  transactionCount?: number
  cashflow?: number
  totalIncome?: number
  totalExpenses?: number
  recurringExpenses?: number
  nonRecurringExpenses?: number
  projectedDailyBudget?: number
  remainingDailyBudget?: number
  actualDailySpend?: number
  totalDaysInMonth?: number
  daysLeft?: number
  daysPassed?: number
  isCurrentMonth?: boolean
  isInPast?: boolean
  isInFuture?: boolean
  spendingByCategory?: SpendingByCategory
} 

export interface Category {
  id: number;
  name: string;
  type: string;
  notes?: string | null;
  createdAt: string;
}

export interface USDSpending {
  categoryId: number;
  _sum: {
      amountCAD: number | null;
  };
}

// export interface CategorySpending {
//   categoryId: number;
//   categoryName: string;
//   _sum: {
//       amountCAD: Number | null;
//   };
//   _count: {
//       amountUSD: number;
//   };
// }

export interface FormatedCategorySpending {
  categoryId: number;
  categoryName: string;
  totalAmountCAD: string;
  totalAmountUSD: string;
  total: number;
}

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  totalAmountCAD: string;
  totalAmountUSD: string;
  total: number;
}

export type SpendingByCategory = CategorySpending[]; 