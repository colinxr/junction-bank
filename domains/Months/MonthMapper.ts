import { Month as PrismaMonth } from '@prisma/client';
import { Month } from './Month';
import { MonthDTO } from './MonthDTO';

export class MonthMapper {
  static toDomain(raw: PrismaMonth): Month {
    return new Month({
      id: raw.id,
      month: raw.month,
      year: raw.year,
      notes: raw.notes || undefined,
      totalIncome: Number(raw.totalIncome),
      totalExpenses: Number(raw.totalExpenses),
      createdAt: raw.createdAt
    });
  }

  static toPersistence(month: Omit<Month, 'id' | 'createdAt' | 'totalIncome' | 'totalExpenses'>): {
    month: number;
    year: number;
    notes: string | null;
    transactionCount: number;
  } {
    return {
      month: month.month,
      year: month.year,
      notes: month.notes || null,
      transactionCount: 0 // Default value for new months
    };
  }

  static toDTO(domain: Month, spendingByCategory?: any): MonthDTO {
    return {
      id: domain.id!,
      month: domain.month,
      year: domain.year,
      notes: domain.notes,
      totalIncome: domain.totalIncome,
      totalExpenses: domain.totalExpenses,
      cashflow: domain.getCashflow(),
      createdAt: domain.createdAt?.toISOString(),
      spendingByCategory
    };
  }
} 