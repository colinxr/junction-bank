import { ITransactionRepository } from '../Repositories/ITransactionRepository';

export class IndexTransactions {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(monthId?: number): Promise<any[]> {
    return await this.transactionRepository.index(monthId);
  }
} 