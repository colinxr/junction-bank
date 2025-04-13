import { TransactionNotFoundException } from '@/domain/exceptions/TransactionException';
import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { TransactionModel } from '../../../infrastructure/persistence/TransactionModel';

export class ShowTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number): Promise<TransactionModel> {
    const transaction = await this.transactionRepository.show(id);

    if (!transaction) {
      throw new TransactionNotFoundException(id);
    }

    return transaction
  }
} 