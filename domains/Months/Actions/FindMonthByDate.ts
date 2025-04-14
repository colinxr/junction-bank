import { IMonthRepository } from '../IMonthRepository';
import { Month } from '../Month';

export class FindMonthByDate {
  constructor(private monthRepository: IMonthRepository) {}

  async execute(date: Date): Promise<Month | null> {
    const month = date.getMonth() + 1; // JavaScript months are 0-based
    const year = date.getFullYear();

    return this.monthRepository.findByDate(month, year);
  }
} 