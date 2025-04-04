import { IRecurringTransactionRepository } from '../../../domain/repositories/IRecurringTransactionRepository';
import { RecurringTransactionNotFoundException } from '../../../domain/exceptions/RecurringTransactionException';

export class DeleteRecurringTransactionUseCase {
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