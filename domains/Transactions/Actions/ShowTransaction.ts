import { TransactionNotFoundException } from '../TransactionException';
import { ITransactionRepository } from '../ITransactionRepository';
import { TransactionModel } from '../TransactionModel';

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