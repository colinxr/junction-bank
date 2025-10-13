import { ITransactionRepository } from '../Repositories/ITransactionRepository';
import { TransactionWithCategory } from '../Validators/types';

export class IndexTransactions {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(monthId?: number): Promise<TransactionWithCategory[]> {
    return await this.transactionRepository.index(monthId);
  }
} 