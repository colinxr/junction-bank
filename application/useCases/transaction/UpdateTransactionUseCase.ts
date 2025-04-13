import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { TransactionNotFoundException } from '@/domain/exceptions/TransactionException';
import { Transaction } from '@/app/types';
import { TransactionMapper } from '@/infrastructure/mappers/TransactionMapper';
import { UpdateTransactionDTO } from '@/application/dtos/transaction/TransactionDTO';
import { TransactionDTO } from '@/application/dtos/transaction/TransactionDTO';

export class UpdateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number, data: UpdateTransactionDTO): Promise<TransactionDTO> {
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
    const updatedTransaction = await this.transactionRepository.update(id, updateData);

    // Convert to DTO for response
    return TransactionMapper.toDTO(updatedTransaction);
  }
} 