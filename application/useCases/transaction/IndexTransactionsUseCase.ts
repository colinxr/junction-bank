import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { Transaction as TransactionEntity } from '@/domain/entities/Transaction';

export class IndexTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(monthId?: number): Promise<TransactionEntity[]> {
    const result = await this.transactionRepository.index(monthId);
    
    return result
  }
} 