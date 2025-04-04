import { IMonthRepository } from '../../../domain/repositories/IMonthRepository';
import { MonthDTO, MonthListResponseDTO } from '../../dtos/month/MonthDTO';
import { Month } from '../../../domain/entities/Month';

export class IndexMonthsUseCase {
  constructor(private monthRepository: IMonthRepository) {}

  async execute(): Promise<MonthListResponseDTO> {
    const result = await this.monthRepository.index();
    
    // Map domain entities to DTOs
    const monthDTOs: MonthDTO[] = result.data.map(month => this.mapToDTO(month));
    
    return {
      data: monthDTOs,
      pagination: result.pagination
    };
  }
  
  private mapToDTO(month: Month): MonthDTO {
    return {
      id: month.id!,
      month: month.month,
      year: month.year,
      notes: month.notes,
      totalIncome: month.totalIncome,
      totalExpenses: month.totalExpenses,
      cashflow: month.getCashflow(),
      createdAt: month.createdAt?.toISOString()
    };
  }
} 