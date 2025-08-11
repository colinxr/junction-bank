import { TransactionNotFoundException } from '../Exceptions/TransactionException';
import { ITransactionRepository } from '../Repositories/ITransactionRepository';
import { TransactionModel } from '../Entities/TransactionModel';

export class ShowTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number): Promise<TransactionModel> {
    const transaction = await this.transactionRepository.show(id);

    if (!transaction) {
      throw new TransactionNotFoundException(id);
    }

    return transaction
  }
} 