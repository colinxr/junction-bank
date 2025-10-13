import { ITransactionRepository } from '../Repositories/ITransactionRepository';
import { TransactionNotFoundException } from '../Exceptions/TransactionException';

export class DeleteTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number): Promise<void> {
    const transaction = await this.transactionRepository.show(id);
    if (!transaction) {
      throw new TransactionNotFoundException(id);
    }

    // Delete the transaction
    await this.transactionRepository.destroy(id);
  }
} 