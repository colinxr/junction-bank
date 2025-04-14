import { IRecurringTransactionRepository } from '../IRecurringTransactionRepository';
import { RecurringTransactionNotFoundException } from '../RecurringTransactionException';

export class DeleteRecurringTransaction {
  constructor(private recurringTransactionRepository: IRecurringTransactionRepository) {}

  async execute(id: number): Promise<void> {
    // Check if recurring transaction exists
    const recurringTransaction = await this.recurringTransactionRepository.show(id);
    if (!recurringTransaction) {
      throw new RecurringTransactionNotFoundException(id);
    }

    // Delete the recurring transaction
    await this.recurringTransactionRepository.destroy(id);
  }
} 