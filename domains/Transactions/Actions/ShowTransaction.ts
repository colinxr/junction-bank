import { ITransactionRepository } from '../Repositories/ITransactionRepository';
import { TransactionWithCategory } from '../Validators/types';

export class ShowTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number): Promise<TransactionWithCategory> {
    const transaction = await this.transactionRepository.show(id);
    
    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    
    return transaction;
  }
} 