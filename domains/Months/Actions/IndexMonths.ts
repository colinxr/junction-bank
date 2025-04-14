import { IMonthRepository } from '../IMonthRepository';
import { MonthDTO, MonthListResponseDTO } from '../MonthDTO';
import { Month } from '../Month';
import { Pagination } from '@supabase/supabase-js';

export class IndexMonths {
  constructor(private monthRepository: IMonthRepository) {}

  async execute(): Promise<{data: Month[], pagination: Pagination}> {
    const {data, pagination} = await this.monthRepository.index();
    
    return {
      data,
      pagination
    };
  }

} 