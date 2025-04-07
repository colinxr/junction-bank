import { Transaction } from '../entities/Transaction';
import { USDSpending } from '@/app/types';
import { CategorySpendingDTO } from '@/application/dtos/transaction/TransactionDTO';

export interface ITransactionRepository {
  index(monthId?: number): Promise<{data: Transaction[], pagination: {total: number}}>;
  show(id: number): Promise<Transaction | null>;
  store(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  getTotalSpendingByCategory(monthId: number): Promise<CategorySpendingDTO[]>;
  getUSDSpendingByCategory(monthId: number): Promise<USDSpending[]>;
} 