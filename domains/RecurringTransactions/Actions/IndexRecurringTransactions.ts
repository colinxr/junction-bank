import { IRecurringTransactionRepository } from '../IRecurringTransactionRepository';
import { RecurringTransaction } from '../RecurringTransaction';
import { Pagination } from '@supabase/supabase-js';

export class IndexRecurringTransactions {
  constructor(private recurringTransactionRepository: IRecurringTransactionRepository) {}

  async execute(): Promise<{data: RecurringTransaction[], pagination: Pagination}> {
    const { data, pagination } = await this.recurringTransactionRepository.index();
    
    return {
      data,
      pagination
    };
  }
} 