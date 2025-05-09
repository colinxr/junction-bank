import { Transaction, USDSpending } from '@/app/types';
import { CategorySpendingDTO } from './TransactionDTO';
import { TransactionModel } from './TransactionModel';

export interface ITransactionRepository {
  index(monthId?: number): Promise<TransactionModel[]>;
  show(id: number): Promise<TransactionModel | null>;
  store(transaction: Omit<Transaction, 'id' | 'validate' | 'isIncome' | 'isExpense' | 'categoryName' | 'createdAt'>): Promise<TransactionModel>;
  update(id: number, transaction: Partial<Transaction>): Promise<TransactionModel>;
  destroy(id: number): Promise<void>;
  getTotalSpendingByCategory(monthId: number): Promise<CategorySpendingDTO[]>;
  getUSDSpendingByCategory(monthId: number): Promise<USDSpending[]>;
} 