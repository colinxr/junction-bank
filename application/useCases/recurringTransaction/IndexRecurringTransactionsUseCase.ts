import { IRecurringTransactionRepository } from '../../../domain/repositories/IRecurringTransactionRepository';
import { RecurringTransactionListResponseDTO } from '../../dtos/recurringTransaction/RecurringTransactionDTO';
import { RecurringTransactionMapper } from '../../../infrastructure/mappers/RecurringTransactionMapper';

export class IndexRecurringTransactionsUseCase {
  constructor(private recurringTransactionRepository: IRecurringTransactionRepository) {}

  async execute(): Promise<RecurringTransactionListResponseDTO> {
    const result = await this.recurringTransactionRepository.index();
    return {
      data: result.data.map(domain => RecurringTransactionMapper.toDTO(domain)),
      pagination: result.pagination
    };
  }
} 