import { IMonthRepository } from '../IMonthRepository';
import { Month } from '../Month';
import { MonthNotFoundException } from '../MonthException';

export class ShowLatestMonth {
  constructor(private monthRepository: IMonthRepository) {}

  async execute(): Promise<Month> {
    const month = await this.monthRepository.findLatest();

    if (!month) {
      throw new MonthNotFoundException('latest');
    }

    return month;
  }
} 