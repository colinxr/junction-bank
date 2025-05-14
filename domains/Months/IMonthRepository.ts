import { Month } from './Month';

export interface IMonthRepository {
  index(options?: { year?: number, page?: number, limit?: number }): Promise<{data: Month[], pagination: any}>;
  show(id: number): Promise<Month | null>;
  findByDate(month: number, year: number): Promise<Month | null>;
  findLatest(): Promise<Month | null>;
  store(month: Omit<Month, 'id' | 'createdAt' | 'totalIncome' | 'totalExpenses'>): Promise<Month>;
  update(id: number, data: Partial<Month>): Promise<Month>;
  destroy(id: number): Promise<void>;
  findByMonthAndYear(month: number, year: number): Promise<boolean>;
  hasTransactions(id: number): Promise<{hasTransactions: boolean, count: number}>;
} 