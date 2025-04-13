import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { TransactionModel } from '../../../infrastructure/persistence/TransactionModel';

export class IndexTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(monthId?: number): Promise<TransactionModel[]> {
    const result = await this.transactionRepository.index(monthId);
    
    return result
  }
} 