import { USDSpending } from '@/app/types';
import { CategorySpendingDTO } from '../DTOs/TransactionDTO';
import { TransactionModel } from '../Entities/TransactionModel';
import { TransactionImportDTO, TransactionImportResultDTO } from '../DTOs/TransactionImportDTO';
import { CoreTransaction } from '../Validators/types';
import { Prisma } from '@prisma/client';

export interface ITransactionRepository {
  index(monthId?: number): Promise<TransactionModel[]>;
  show(id: number): Promise<TransactionModel | null>;
  store(
    transaction: Omit<CoreTransaction, 'id'>, 
    prismaTransaction?: Prisma.TransactionClient
  ): Promise<TransactionModel>;
  update(id: number, transaction: Partial<CoreTransaction>): Promise<TransactionModel>;
  destroy(id: number): Promise<void>;
  getTotalSpendingByCategory(monthId: number): Promise<CategorySpendingDTO[]>;
  getUSDSpendingByCategory(monthId: number): Promise<USDSpending[]>;
  importTransactions(transactions: TransactionImportDTO[]): Promise<TransactionImportResultDTO>;
} 