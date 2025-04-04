import { IMonthRepository } from '../../../domain/repositories/IMonthRepository';
import { MonthNotFoundException, MonthHasTransactionsException } from '../../../domain/exceptions/MonthException';

export class DestroyMonthUseCase {
  constructor(private monthRepository: IMonthRepository) {}

  async execute(id: number): Promise<void> {
    // Check if month exists
    const month = await this.monthRepository.show(id);
    if (!month) {
      throw new MonthNotFoundException(id);
    }

    // Check if month has transactions
    const { hasTransactions, count } = await this.monthRepository.hasTransactions(id);
    if (hasTransactions) {
      throw new MonthHasTransactionsException(id, count);
    }

    // Delete the month
    await this.monthRepository.destroy(id);
  }
} 