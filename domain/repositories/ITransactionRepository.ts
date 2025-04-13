import { Transaction, USDSpending } from '@/app/types';
import { CategorySpendingDTO, TransactionDTO } from '@/application/dtos/transaction/TransactionDTO';
import { TransactionModel } from '../../infrastructure/persistence/TransactionModel';
import { Transaction as TransactionEntity } from '@/domain/entities/Transaction';

export interface ITransactionRepository {
  index(monthId?: number): Promise<TransactionEntity[]>;
  show(id: number): Promise<TransactionModel | null>;
  store(transaction: Omit<Transaction, 'id' | 'validate' | 'isIncome' | 'isExpense' | 'categoryName'>): Promise<TransactionModel>;
  update(id: number, transaction: Partial<Transaction>): Promise<TransactionModel>;
  destroy(id: number): Promise<void>;
  getTotalSpendingByCategory(monthId: number): Promise<CategorySpendingDTO[]>;
  getUSDSpendingByCategory(monthId: number): Promise<USDSpending[]>;
} 