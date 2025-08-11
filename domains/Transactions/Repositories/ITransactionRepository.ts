import { Transaction } from '../Entities/Transaction';
import { CoreTransaction } from '../Validators/types';
import { TransactionCreateDTO } from '../DTOs/TransactionDTO';
import { TransactionImportDTO } from '../DTOs/TransactionImportDTO';
import { TransactionImportResultDTO } from '../DTOs/TransactionImportDTO';
import { CategorySpendingDTO } from '../DTOs/TransactionDTO';
import { USDSpending } from '@/app/types';

export interface ITransactionRepository {
  index(monthId?: number): Promise<any[]>; // Using any[] for now, will refine with Prisma types
  show(id: number): Promise<any | null>; // Using any for now, will refine with Prisma types
  store(transaction: Omit<CoreTransaction, 'id'>, prismaTransaction?: any): Promise<any>; // Using any for now, will refine with Prisma types
  update(id: number, transaction: Partial<CoreTransaction>): Promise<any>; // Using any for now, will refine with Prisma types
  destroy(id: number): Promise<void>;
  importTransactions(transactions: TransactionImportDTO[]): Promise<TransactionImportResultDTO>;
  getTotalSpendingByCategory(monthId: number): Promise<CategorySpendingDTO[]>;
  getUSDSpendingByCategory(monthId: number): Promise<USDSpending[]>;
} 