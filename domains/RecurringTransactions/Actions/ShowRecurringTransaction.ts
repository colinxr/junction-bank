import { IRecurringTransactionRepository } from '../IRecurringTransactionRepository';
import { RecurringTransactionNotFoundException } from '../RecurringTransactionException';
import { RecurringTransaction } from '../RecurringTransaction';

export class ShowRecurringTransaction {
  constructor(private recurringTransactionRepository: IRecurringTransactionRepository) {}

  async execute(id: number): Promise<RecurringTransaction> {
    const recurringTransaction = await this.recurringTransactionRepository.show(id);

    if (!recurringTransaction) {
      throw new RecurringTransactionNotFoundException(id);
    }

    return recurringTransaction;
  }
} 