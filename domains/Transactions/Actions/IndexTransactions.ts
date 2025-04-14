import { ITransactionRepository } from '../ITransactionRepository';
import { TransactionModel } from '../TransactionModel';

export class IndexTransactions {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(monthId?: number): Promise<TransactionModel[]> {
    const result = await this.transactionRepository.index(monthId);
    
    return result
  }
} 