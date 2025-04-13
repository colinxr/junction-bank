import { Prisma } from '@prisma/client';
import { TransactionType } from '@/domain/entities/Transaction';

export interface Transaction {
  id: number
  userId: string
  monthId: number
  name: string
  amountCAD: number
  amountUSD: number | null
  categoryId: number
  categoryName: string,
  notes: string | null
  date: Date
  type: TransactionType
  createdAt: string
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
      amountCAD: Prisma.Decimal | null;
  };
}

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  _sum: {
      amountCAD: Prisma.Decimal | null;
  };
  _count: {
      amountUSD: number;
  };
}

export interface FormatedCategorySpending {
  categoryId: number;
  categoryName: string;
  totalAmountCAD: string;
  totalAmountUSD: string;
  total: number;
}