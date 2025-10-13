import { IMonthRepository } from '../IMonthRepository';
import { MonthDTO, MonthListResponseDTO } from '../MonthDTO';
import { Month } from '../Month';
export class IndexMonths {
  constructor(private monthRepository: IMonthRepository) {}

  async execute(): Promise<{data: Month[], pagination: any}> {
    const {data, pagination} = await this.monthRepository.index();
    
    return {
      data,
      pagination
    };
  }

} 