import { ITransactionRepository } from '../Repositories/ITransactionRepository';
import { TransactionCreateDTO } from '../DTOs/TransactionDTO';
import { toCoreTransaction } from '../Adapters/TransactionAdapters';
import { TransactionType } from '../Entities/Transaction';
import { TransactionWithCategory } from '../Validators/types';

export class StoreTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(data: TransactionCreateDTO): Promise<TransactionWithCategory> {
    // Convert DTO to domain model
    const coreTransaction = toCoreTransaction(data);
    
    // Store in repository
    const savedTransaction = await this.transactionRepository.store(coreTransaction);
    
    return savedTransaction;
  }
} 