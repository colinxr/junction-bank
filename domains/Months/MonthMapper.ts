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
      recurringExpenses: Number(raw.recurringExpenses || 0),
      createdAt: raw.createdAt
    });
  }

  static toPersistence(month: Omit<Month, 'id' | 'createdAt' | 'totalIncome' | 'totalExpenses' | 'recurringExpenses'>): {
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
      recurringExpenses: domain.recurringExpenses,
      nonRecurringExpenses: domain.getNonRecurringExpenses(),
      cashflow: domain.getCashflow(),
      createdAt: domain.createdAt,
      spendingByCategory,
      // New financial planning metrics
      projectedDailyBudget: domain.getDailyBudget(),
      remainingDailyBudget: domain.getDailySpendRate(),
      actualDailySpend: domain.getAverageDailySpend(),
      // Date information
      totalDaysInMonth: domain.getTotalDaysInMonth(),
      daysLeft: domain.getDaysLeftInMonth(),
      daysPassed: domain.getDaysPassedInMonth(),
      isCurrentMonth: domain.isCurrentMonth(),
      isInPast: domain.isInPast(),
      isInFuture: domain.isInFuture()
    };
  }
} 