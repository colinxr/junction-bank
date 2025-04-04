import { IRecurringTransactionRepository } from '../../../domain/repositories/IRecurringTransactionRepository';
import { RecurringTransaction } from '../../../domain/entities/RecurringTransaction';
import { RecurringTransactionNotFoundException } from '../../../domain/exceptions/RecurringTransactionException';
import { RecurringTransactionMapper } from '../../../infrastructure/mappers/RecurringTransactionMapper';
import { RecurringTransactionDTO } from '../../dtos/recurringTransaction/RecurringTransactionDTO';

export class ShowRecurringTransactionUseCase {
  constructor(private recurringTransactionRepository: IRecurringTransactionRepository) {}

  async execute(id: number): Promise<RecurringTransactionDTO> {
    const recurringTransaction = await this.recurringTransactionRepository.show(id);

    if (!recurringTransaction) {
      throw new RecurringTransactionNotFoundException(id);
    }

    return RecurringTransactionMapper.toDTO(recurringTransaction);
  }
} 