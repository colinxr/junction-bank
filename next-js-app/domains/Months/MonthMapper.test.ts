import { describe, it, expect, vi } from 'vitest';
import { MonthMapper } from './MonthMapper';
import { Month } from './Month';
import { Prisma } from '@prisma/client';

describe('MonthMapper', () => {
  const testDate = new Date('2023-01-01');
  
  // Create mock Prisma Decimal values
  const createDecimal = (value: number) => {
    return {
      d: [value],
      toNumber: () => value,
      toString: () => value.toString()
    } as unknown as Prisma.Decimal;
  };
  
  const prismaMonthData = {
    id: 1,
    month: 3,
    year: 2023,
    notes: 'Test month',
    totalIncome: createDecimal(5000),
    totalExpenses: createDecimal(3000),
    recurringExpenses: createDecimal(1500),
    transactionCount: 10,
    createdAt: testDate
  };
  
  it('converts Prisma entity to domain entity', () => {
    const domain = MonthMapper.toDomain(prismaMonthData);
    
    expect(domain).toBeInstanceOf(Month);
    expect(domain.id).toBe(1);
    expect(domain.month).toBe(3);
    expect(domain.year).toBe(2023);
    expect(domain.notes).toBe('Test month');
    expect(domain.totalIncome).toBe(5000);
    expect(domain.totalExpenses).toBe(3000);
    expect(domain.recurringExpenses).toBe(1500);
    expect(domain.createdAt).toEqual(testDate);
  });
  
  it('converts domain entity to persistence data', () => {
    const domain = new Month({
      month: 4,
      year: 2023,
      notes: 'Test month'
    });
    
    const persistence = MonthMapper.toPersistence(domain);
    
    expect(persistence).toEqual({
      month: 4,
      year: 2023,
      notes: 'Test month',
      transactionCount: 0
    });
  });
  
  it('handles null notes in prisma entity', () => {
    const prismaMonthWithNullNotes = {
      ...prismaMonthData,
      notes: null
    };
    
    const domain = MonthMapper.toDomain(prismaMonthWithNullNotes);
    expect(domain.notes).toBeUndefined();
  });
  
  it('converts domain entity to DTO', () => {
    // Mock the date functions to return consistent values
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-03-15T12:00:00Z')); // Mid-March 2023
    
    const domain = new Month({
      id: 1,
      month: 3,
      year: 2023,
      notes: 'Test month',
      totalIncome: 5000,
      totalExpenses: 3000,
      recurringExpenses: 1500,
      createdAt: testDate
    });
    
    const dto = MonthMapper.toDTO(domain);
    
    expect(dto).toEqual({
      id: 1,
      month: 3,
      year: 2023,
      notes: 'Test month',
      totalIncome: 5000,
      totalExpenses: 3000,
      recurringExpenses: 1500,
      nonRecurringExpenses: 1500,
      cashflow: 2000,
      createdAt: testDate,
      spendingByCategory: undefined,
      projectedDailyBudget: 112.9, // (5000 - 1500) / 31 = 112.90
      remainingDailyBudget: 125, // 2000 / 16 = 125
      actualDailySpend: 100, // 1500 / 15 = 100 (assuming 15 days passed)
      totalDaysInMonth: 31,
      daysLeft: 16,
      daysPassed: 15,
      isCurrentMonth: true,
      isInPast: false,
      isInFuture: false
    });
    
    vi.useRealTimers();
  });
  
  it('converts domain entity to DTO with spending by category', () => {
    const domain = new Month({
      id: 1,
      month: 5,
      year: 2023,
      totalIncome: 5000,
      totalExpenses: 3000,
      recurringExpenses: 1500
    });
    
    const spendingByCategory = [
      { categoryId: 1, categoryName: 'Food', amount: 1200 },
      { categoryId: 2, categoryName: 'Utilities', amount: 800 }
    ];
    
    const dto = MonthMapper.toDTO(domain, spendingByCategory);
    
    expect(dto.spendingByCategory).toEqual(spendingByCategory);
  });
}); 