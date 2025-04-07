import { IRecurringTransactionRepository } from '../../../domain/repositories/IRecurringTransactionRepository';
import { RecurringTransaction, TransactionType } from '../../../domain/entities/RecurringTransaction';
import { CreateRecurringTransactionDTO } from '../../dtos/recurringTransaction/RecurringTransactionDTO';

export class StoreRecurringTransactionUseCase {
  constructor(private recurringTransactionRepository: IRecurringTransactionRepository) {}

  async execute(data: CreateRecurringTransactionDTO): Promise<RecurringTransaction> {
    const recurringTransaction = RecurringTransaction.create({
      userId: data.userId,
      name: data.name,
      amountCAD: data.amountCAD,
      amountUSD: data.amountUSD,
      categoryId: data.categoryId,
      notes: data.notes,
      dayOfMonth: data.dayOfMonth,
      type: data.type as TransactionType
    });

    return await this.recurringTransactionRepository.store(recurringTransaction);
  }
} 