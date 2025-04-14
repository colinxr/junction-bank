import { IMonthRepository } from '../IMonthRepository';
import { Month } from '../Month';
import { MonthNotFoundException } from '../MonthException';

export class ShowMonth {
  constructor(private monthRepository: IMonthRepository) {}

  async execute(id: number): Promise<Month> {
    const month = await this.monthRepository.show(id);

    if (!month) {
      throw new MonthNotFoundException(id);
    }

    return month;
  }
} 