import { Transaction, USDSpending } from '@/app/types';
import { CategorySpendingDTO } from './TransactionDTO';
import { TransactionModel } from './TransactionModel';
import { TransactionImportDTO, TransactionImportResultDTO } from './TransactionImportDTO';
import { Prisma } from '@prisma/client';

export interface ITransactionRepository {
  index(monthId?: number): Promise<TransactionModel[]>;
  show(id: number): Promise<TransactionModel | null>;
  store(
    transaction: Omit<Transaction, 'id' | 'validate' | 'isIncome' | 'isExpense' | 'categoryName' | 'createdAt'>, 
    prismaTransaction?: Prisma.TransactionClient
  ): Promise<TransactionModel>;
  update(id: number, transaction: Partial<Transaction>): Promise<TransactionModel>;
  destroy(id: number): Promise<void>;
  getTotalSpendingByCategory(monthId: number): Promise<CategorySpendingDTO[]>;
  getUSDSpendingByCategory(monthId: number): Promise<USDSpending[]>;
  importTransactions(transactions: TransactionImportDTO[]): Promise<TransactionImportResultDTO>;
} 