import { RecurringTransaction } from './RecurringTransaction';

export interface IRecurringTransactionRepository {
  index(): Promise<{data: RecurringTransaction[], pagination: any}>;
  show(id: number): Promise<RecurringTransaction | null>;
  store(recurringTransaction: Omit<RecurringTransaction, 'id' | 'createdAt'>): Promise<RecurringTransaction>;
  update(id: number, data: Partial<RecurringTransaction>): Promise<RecurringTransaction>;
  destroy(id: number): Promise<void>;
  findByName(name: string): Promise<boolean>;
  applyToMonth(monthId: number, month: number, year: number): Promise<number>;
} 