import { IMonthRepository } from '../../../domain/repositories/IMonthRepository';
import { Month } from '../../../domain/entities/Month';

export class FindMonthByDateUseCase {
  constructor(private monthRepository: IMonthRepository) {}

  async execute(date: Date): Promise<Month | null> {
    const month = date.getMonth() + 1; // JavaScript months are 0-based
    const year = date.getFullYear();

    return this.monthRepository.findByDate(month, year);
  }
} 