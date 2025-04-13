import { TransactionNotFoundException } from '@/domain/exceptions/TransactionException';
import { TransactionMapper } from '@/infrastructure/mappers/TransactionMapper';
import { TransactionDTO } from '../../dtos/transaction/TransactionDTO';
import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';

export class ShowTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number): Promise<TransactionDTO> {
    const transaction = await this.transactionRepository.show(id);

    if (!transaction) {
      throw new TransactionNotFoundException(id);
    }

    return TransactionMapper.toDTO(transaction);
  }
} 