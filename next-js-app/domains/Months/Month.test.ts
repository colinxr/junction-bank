import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Month } from './Month';
import { InvalidMonthNumberException, InvalidYearException } from './MonthException';

describe('Month', () => {
  it('creates a valid month with minimum fields', () => {
    const month = Month.create({
      month: 3,
      year: 2023
    });
    
    expect(month.month).toBe(3);
    expect(month.year).toBe(2023);
    expect(month.totalIncome).toBe(0);
    expect(month.totalExpenses).toBe(0);
    expect(month.recurringExpenses).toBe(0);
    expect(month.notes).toBeUndefined();
  });
  
  it('creates a month with all fields', () => {
    const month = Month.create({
      month: 4,
      year: 2023,
      notes: 'Test month',
      totalIncome: 5000,
      totalExpenses: 3000,
      recurringExpenses: 1500
    });
    
    expect(month.month).toBe(4);
    expect(month.year).toBe(2023);
    expect(month.notes).toBe('Test month');
    expect(month.totalIncome).toBe(5000);
    expect(month.totalExpenses).toBe(3000);
    expect(month.recurringExpenses).toBe(1500);
  });
  
  it('throws InvalidMonthNumberException when month is invalid', () => {
    expect(() => Month.create({
      month: 0,
      year: 2023
    })).toThrow(InvalidMonthNumberException);
    
    expect(() => Month.create({
      month: 13,
      year: 2023
    })).toThrow(InvalidMonthNumberException);
  });
  
  it('throws InvalidYearException when year is invalid', () => {
    expect(() => Month.create({
      month: 5,
      year: 1899
    })).toThrow(InvalidYearException);
    
    expect(() => Month.create({
      month: 5,
      year: 2101
    })).toThrow(InvalidYearException);
  });
  
  it('calculates cash flow correctly', () => {
    const month = Month.create({
      month: 6,
      year: 2023,
      totalIncome: 6000,
      totalExpenses: 4500
    });
    
    expect(month.getCashflow()).toBe(1500);
  });
  
  it('returns correct month name', () => {
    const january = Month.create({ month: 1, year: 2023 });
    const july = Month.create({ month: 7, year: 2023 });
    const december = Month.create({ month: 12, year: 2023 });
    
    expect(january.getMonthName()).toBe('January');
    expect(july.getMonthName()).toBe('July');
    expect(december.getMonthName()).toBe('December');
  });
  
  it('calculates non-recurring expenses correctly', () => {
    const month = Month.create({
      month: 8,
      year: 2023,
      totalExpenses: 3000,
      recurringExpenses: 1200
    });
    
    expect(month.getNonRecurringExpenses()).toBe(1800);
  });
  
  it('determines total days in a month correctly', () => {
    const february2023 = Month.create({ month: 2, year: 2023 });
    const february2024 = Month.create({ month: 2, year: 2024 }); // Leap year
    const august2023 = Month.create({ month: 8, year: 2023 });
    
    expect(february2023.getTotalDaysInMonth()).toBe(28);
    expect(february2024.getTotalDaysInMonth()).toBe(29);
    expect(august2023.getTotalDaysInMonth()).toBe(31);
  });
  
  it('calculates projected daily budget correctly', () => {
    const month = Month.create({
      month: 9,
      year: 2023,
      totalIncome: 6000,
      recurringExpenses: 3000
    });
    
    // (6000 - 3000) / 30 = 100
    expect(month.getProjectedDailyBudget()).toBe(100);
  });
  
  it('correctly identifies if a month belongs to a date', () => {
    const month = Month.create({
      month: 5,
      year: 2023
    });
    
    expect(month.belongsToDate(new Date('2023-05-15'))).toBe(true);
    expect(month.belongsToDate(new Date('2023-06-15'))).toBe(false);
    expect(month.belongsToDate(new Date('2022-05-15'))).toBe(false);
  });
  
  describe('Time-dependent functions', () => {
    // Mock current date for consistent testing
    const mockDate = new Date('2023-07-15T12:00:00Z');
    const originalDate = global.Date;
    
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });
    
    it('identifies current month correctly', () => {
      const pastMonth = Month.create({ month: 6, year: 2023 });
      const currentMonth = Month.create({ month: 7, year: 2023 });
      const futureMonth = Month.create({ month: 8, year: 2023 });
      const differentYearMonth = Month.create({ month: 7, year: 2022 });
      
      expect(pastMonth.isCurrentMonth()).toBe(false);
      expect(currentMonth.isCurrentMonth()).toBe(true);
      expect(futureMonth.isCurrentMonth()).toBe(false);
      expect(differentYearMonth.isCurrentMonth()).toBe(false);
    });
    
    it('identifies past months correctly', () => {
      const pastMonth = Month.create({ month: 6, year: 2023 });
      const currentMonth = Month.create({ month: 7, year: 2023 });
      const futureMonth = Month.create({ month: 8, year: 2023 });
      const pastYearMonth = Month.create({ month: 12, year: 2022 });
      
      expect(pastMonth.isInPast()).toBe(true);
      expect(currentMonth.isInPast()).toBe(false);
      expect(futureMonth.isInPast()).toBe(false);
      expect(pastYearMonth.isInPast()).toBe(true);
    });
    
    it('identifies future months correctly', () => {
      const pastMonth = Month.create({ month: 6, year: 2023 });
      const currentMonth = Month.create({ month: 7, year: 2023 });
      const futureMonth = Month.create({ month: 8, year: 2023 });
      const futureYearMonth = Month.create({ month: 1, year: 2024 });
      
      expect(pastMonth.isInFuture()).toBe(false);
      expect(currentMonth.isInFuture()).toBe(false);
      expect(futureMonth.isInFuture()).toBe(true);
      expect(futureYearMonth.isInFuture()).toBe(true);
    });
    
    it('calculates days left in month correctly', () => {
      const currentMonth = Month.create({ month: 7, year: 2023 });
      const futureMonth = Month.create({ month: 8, year: 2023 });
      const pastMonth = Month.create({ month: 6, year: 2023 });
      
      // July has 31 days, and we're at day 15, so 31 - 15 = 16 days left
      expect(currentMonth.getDaysLeftInMonth()).toBe(16);
      // Future month should have all days left
      expect(futureMonth.getDaysLeftInMonth()).toBe(31);
      // Past month should have 0 days left
      expect(pastMonth.getDaysLeftInMonth()).toBe(0);
    });
    
    it('calculates days passed in month correctly', () => {
      const currentMonth = Month.create({ month: 7, year: 2023 });
      const futureMonth = Month.create({ month: 8, year: 2023 });
      const pastMonth = Month.create({ month: 6, year: 2023 });
      
      // We're at day 15 of July
      expect(currentMonth.getDaysPassedInMonth()).toBe(15);
      // Future month should have 0 days passed
      expect(futureMonth.getDaysPassedInMonth()).toBe(0);
      // Past month should have all days passed
      expect(pastMonth.getDaysPassedInMonth()).toBe(30);
    });
    
    it('calculates remaining daily budget correctly', () => {
      const currentMonth = Month.create({
        month: 7,
        year: 2023,
        totalIncome: 6200,
        totalExpenses: 3000
      });
      
      // Cashflow = 6200 - 3000 = 3200
      // Days left = 16
      // Remaining daily budget = 3200 / 16 = 200
      expect(currentMonth.getRemainingDailyBudget()).toBe(200);
    });
    
    it('calculates actual daily spend correctly', () => {
      const currentMonth = Month.create({
        month: 7,
        year: 2023,
        totalExpenses: 3000,
        recurringExpenses: 1500
      });
      
      // Non-recurring expenses = 3000 - 1500 = 1500
      // Days passed = 15
      // Actual daily spend = 1500 / 15 = 100
      expect(currentMonth.getActualDailySpend()).toBe(100);
    });
  });
}); 