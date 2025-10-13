import { Transaction } from '../Entities/Transaction';
import { CoreTransaction } from '../Validators/types';
import { TransactionCreateDTO } from '../DTOs/TransactionDTO';
import { TransactionImportDTO } from '../DTOs/TransactionImportDTO';
import { TransactionImportResultDTO } from '../DTOs/TransactionImportDTO';
import { CategorySpendingDTO } from '../DTOs/TransactionDTO';
import { USDSpending } from '@/app/types';
import { TransactionWithCategory } from '../Validators/types';
import { Prisma } from '@prisma/client';

export interface ITransactionRepository {
  index(monthId?: number): Promise<TransactionWithCategory[]>;
  show(id: number): Promise<TransactionWithCategory | null>;
  store(transaction: Omit<CoreTransaction, 'id'>, prismaTransaction?: Prisma.TransactionClient): Promise<TransactionWithCategory>;
  update(id: number, transaction: Partial<CoreTransaction>): Promise<TransactionWithCategory>;
  destroy(id: number): Promise<void>;
  importTransactions(transactions: TransactionImportDTO[]): Promise<TransactionImportResultDTO>;
  getTotalSpendingByCategory(monthId: number): Promise<CategorySpendingDTO[]>;
  getUSDSpendingByCategory(monthId: number): Promise<USDSpending[]>;
} 