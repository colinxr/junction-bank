import { Transaction } from '@/app/types';
import { USDSpending } from '@/app/types';
import { CategorySpendingDTO } from '@/application/dtos/transaction/TransactionDTO';

export interface ITransactionRepository {
  index(monthId?: number): Promise<{data: Transaction[], pagination: {total: number}}>;
  show(id: number): Promise<Transaction | null>;
  store(transaction: Omit<Transaction, 'id' | 'validate' | 'isIncome' | 'isExpense'>): Promise<Transaction>;
  getTotalSpendingByCategory(monthId: number): Promise<CategorySpendingDTO[]>;
  getUSDSpendingByCategory(monthId: number): Promise<USDSpending[]>;
} 