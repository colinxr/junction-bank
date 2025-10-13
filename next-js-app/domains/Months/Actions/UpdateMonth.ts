import { IMonthRepository } from '../IMonthRepository';
import { Month } from '../Month';
import { UpdateMonthDTO } from '../MonthDTO';
import { MonthNotFoundException, MonthAlreadyExistsException } from '../MonthException';

export class UpdateMonth {
  constructor(private monthRepository: IMonthRepository) {}

  async execute(id: number, data: UpdateMonthDTO): Promise<Month> {
    // Check if month exists
    const month = await this.monthRepository.show(id);
    if (!month) {
      throw new MonthNotFoundException(id);
    }

    // If month or year are changing, check for conflicts
    if ((data.month && data.month !== month.month) ||
        (data.year && data.year !== month.year)) {
      const exists = await this.monthRepository.findByMonthAndYear(
        data.month || month.month,
        data.year || month.year
      );

      if (exists) {
        throw new MonthAlreadyExistsException(
          data.month || month.month,
          data.year || month.year
        );
      }
    }

    // Convert DTO to domain entity structure
    const updateData: Partial<Month> = {
      month: data.month,
      year: data.year,
      notes: data.notes === null ? undefined : data.notes
    };

    // Update the month
    return this.monthRepository.update(id, updateData);
  }
} 