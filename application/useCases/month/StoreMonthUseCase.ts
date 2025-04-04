import { IMonthRepository } from '../../../domain/repositories/IMonthRepository';
import { Month } from '../../../domain/entities/Month';
import { CreateMonthDTO } from '../../dtos/month/MonthDTO';
import { MonthAlreadyExistsException } from '../../../domain/exceptions/MonthException';

export class StoreMonthUseCase {
  constructor(
    private monthRepository: IMonthRepository,
    private applyRecurringTransactions?: (monthId: number, month: number, year: number) => Promise<void>
  ) {}

  async execute(data: CreateMonthDTO): Promise<Month> {
    // Check if month already exists
    const exists = await this.monthRepository.findByMonthAndYear(data.month, data.year);
    if (exists) {
      throw new MonthAlreadyExistsException(data.month, data.year);
    }

    // Create the domain entity (validate business rules)
    const month = Month.create({
      month: data.month,
      year: data.year,
      notes: data.notes
    });

    // Persist through repository
    const createdMonth = await this.monthRepository.store(month);

    // Apply recurring transactions if function is provided
    if (this.applyRecurringTransactions && createdMonth.id) {
      try {
        await this.applyRecurringTransactions(createdMonth.id, createdMonth.month, createdMonth.year);
      } catch (error) {
        console.error('Error applying recurring transactions:', error);
        // Continue even if recurring transactions fail - the month is still created
      }
    }

    return createdMonth;
  }
} 