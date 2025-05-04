import { ITransactionRepository } from '../ITransactionRepository';
import { TransactionNotFoundException } from '../TransactionException';

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