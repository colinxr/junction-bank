import { IRecurringTransactionRepository } from '../IRecurringTransactionRepository';
import { RecurringTransaction } from '../RecurringTransaction';
export class IndexRecurringTransactions {
  constructor(private recurringTransactionRepository: IRecurringTransactionRepository) {}

  async execute(): Promise<{data: RecurringTransaction[], pagination: any}> {
    const { data, pagination } = await this.recurringTransactionRepository.index();
    
    return {
      data,
      pagination
    };
  }
} 