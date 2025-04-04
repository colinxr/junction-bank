import { IMonthRepository } from '../../../domain/repositories/IMonthRepository';
import { Month } from '../../../domain/entities/Month';
import { MonthNotFoundException } from '../../../domain/exceptions/MonthException';

export class ShowMonthUseCase {
  constructor(private monthRepository: IMonthRepository) {}

  async execute(id: number): Promise<Month> {
    const month = await this.monthRepository.show(id);

    if (!month) {
      throw new MonthNotFoundException(id);
    }

    return month;
  }
} 