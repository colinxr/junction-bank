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
      totalIncome: parseFloat(domain.totalIncome.toFixed(2)),
      totalExpenses: parseFloat(domain.totalExpenses.toFixed(2)),
      recurringExpenses: parseFloat(domain.recurringExpenses.toFixed(2)),
      nonRecurringExpenses: parseFloat(domain.getNonRecurringExpenses().toFixed(2)),
      cashflow: parseFloat(domain.getCashflow().toFixed(2)),
      createdAt: domain.createdAt,
      spendingByCategory,
      // New financial planning metrics
      projectedDailyBudget: parseFloat(domain.getProjectedDailyBudget().toFixed(2)),
      remainingDailyBudget: parseFloat(domain.getRemainingDailyBudget().toFixed(2)),
      actualDailySpend: parseFloat(domain.getActualDailySpend().toFixed(2)),
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