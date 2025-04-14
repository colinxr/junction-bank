import { ITransactionRepository } from '../ITransactionRepository';
import { TransactionNotFoundException } from '../TransactionException';
import { UpdateTransactionDTO} from '../TransactionDTO';

import { TransactionModel } from '../TransactionModel';
import { Transaction } from '@/app/types';

export class UpdateTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number, data: UpdateTransactionDTO): Promise<TransactionModel> {
    // Check if recurring transaction exists
    const transaction = await this.transactionRepository.show(id);
    if (!transaction) {
      throw new TransactionNotFoundException(id);
    }

    // Convert DTO to domain entity structure
    const updateData: Partial<Transaction> = {
      name: data.name,
      amountCAD: data.amountCAD,
      amountUSD: data.amountUSD === null ? undefined : data.amountUSD,
      categoryId: data.categoryId,
      notes: data.notes === null ? undefined : data.notes,
      type: data.type as any
    };

    // Update the recurring transaction
    return await this.transactionRepository.update(id, updateData);
  }
} 