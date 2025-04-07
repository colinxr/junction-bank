import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { TransactionNotFoundException } from '../../../domain/exceptions/TransactionException';

export class DeleteTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number): Promise<void> {
    // Check if transaction exists
    const transaction = await this.transactionRepository.show(id);
    if (!transaction) {
      throw new TransactionNotFoundException(id);
    }

    // Delete the transaction
    await this.transactionRepository.destroy(id);
  }
} 