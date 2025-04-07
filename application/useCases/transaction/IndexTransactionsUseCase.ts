import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { TransactionListResponseDTO } from '@/application/dtos/transaction/TransactionDTO';
import { TransactionMapper } from '@/infrastructure/mappers/TransactionMapper';

export class IndexTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(): Promise<TransactionListResponseDTO> {
    const result = await this.transactionRepository.index();
    return {
      data: result.data.map(domain => TransactionMapper.toDTO(domain)),
      pagination: result.pagination
    };
  }
} 