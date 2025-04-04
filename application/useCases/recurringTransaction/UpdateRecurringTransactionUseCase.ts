import { IRecurringTransactionRepository } from '../../../domain/repositories/IRecurringTransactionRepository';
import { RecurringTransaction } from '../../../domain/entities/RecurringTransaction';
import { UpdateRecurringTransactionDTO } from '../../dtos/recurringTransaction/RecurringTransactionDTO';
import { RecurringTransactionNotFoundException, RecurringTransactionAlreadyExistsException } from '../../../domain/exceptions/RecurringTransactionException';
import { RecurringTransactionMapper } from '../../../infrastructure/mappers/RecurringTransactionMapper';
import { RecurringTransactionDTO } from '../../dtos/recurringTransaction/RecurringTransactionDTO';

export class UpdateRecurringTransactionUseCase {
  constructor(private recurringTransactionRepository: IRecurringTransactionRepository) {}

  async execute(id: number, data: UpdateRecurringTransactionDTO): Promise<RecurringTransactionDTO> {
    // Check if recurring transaction exists
    const recurringTransaction = await this.recurringTransactionRepository.show(id);
    if (!recurringTransaction) {
      throw new RecurringTransactionNotFoundException(id);
    }

    // If name is changing, check for conflicts
    if (data.name && data.name !== recurringTransaction.name) {
      const exists = await this.recurringTransactionRepository.findByName(
        data.name
      );

      if (exists) {
        throw new RecurringTransactionAlreadyExistsException(data.name);
      }
    }

    // Convert DTO to domain entity structure
    const updateData: Partial<RecurringTransaction> = {
      name: data.name,
      amountCAD: data.amountCAD,
      amountUSD: data.amountUSD === null ? undefined : data.amountUSD,
      categoryId: data.categoryId,
      notes: data.notes === null ? undefined : data.notes,
      dayOfMonth: data.dayOfMonth === null ? undefined : data.dayOfMonth,
      type: data.type as any
    };

    // Update the recurring transaction
    const updatedTransaction = await this.recurringTransactionRepository.update(id, updateData);

    // Convert to DTO for response
    return RecurringTransactionMapper.toDTO(updatedTransaction);
  }
} 