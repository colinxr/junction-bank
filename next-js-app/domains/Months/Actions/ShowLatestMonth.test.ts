import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShowLatestMonth } from './ShowLatestMonth';
import { Month } from '../Month';
import { MonthNotFoundException } from '../MonthException';
import { IMonthRepository } from '../IMonthRepository';

describe('ShowLatestMonth', () => {
  // Create mock repository with all required methods
  const mockRepository = {
    index: vi.fn(),
    show: vi.fn(),
    findByDate: vi.fn(),
    findLatest: vi.fn(),
    store: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    findByMonthAndYear: vi.fn(),
    hasTransactions: vi.fn(),
    recalculateRecurringExpenses: vi.fn()
  };
  
  const action = new ShowLatestMonth(mockRepository as unknown as IMonthRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should return the latest month when it exists', async () => {
    // Set up test data
    const latestMonth = new Month({
      id: 3,
      month: 12,
      year: 2023,
      notes: 'Latest month',
      totalIncome: 8000,
      totalExpenses: 5000,
      recurringExpenses: 2000
    });
    
    // Set up mock
    mockRepository.findLatest.mockResolvedValue(latestMonth);
    
    // Execute
    const result = await action.execute();
    
    // Assert
    expect(mockRepository.findLatest).toHaveBeenCalledWith();
    expect(mockRepository.findLatest).toHaveBeenCalledTimes(1);
    expect(result).toBe(latestMonth);
    expect(result).toBeInstanceOf(Month);
    expect(result.id).toBe(3);
    expect(result.month).toBe(12);
    expect(result.year).toBe(2023);
  });
  
  it('should throw MonthNotFoundException when no months exist', async () => {
    // Set up mock to return null
    mockRepository.findLatest.mockResolvedValue(null);
    
    // Execute and expect error
    await expect(action.execute()).rejects.toThrow(MonthNotFoundException);
    
    // Assert repository was called
    expect(mockRepository.findLatest).toHaveBeenCalledWith();
    expect(mockRepository.findLatest).toHaveBeenCalledTimes(1);
  });
  
  it('should throw correct MonthNotFoundException message for latest month', async () => {
    // Set up mock to return null
    mockRepository.findLatest.mockResolvedValue(null);
    
    // Execute and expect specific error message
    try {
      await action.execute();
      // Should not reach this point
      expect.fail('Expected MonthNotFoundException to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(MonthNotFoundException);
      expect((error as MonthNotFoundException).message).toBe('No months found in the database');
    }
    
    // Assert repository was called
    expect(mockRepository.findLatest).toHaveBeenCalledWith();
  });
  
  it('should propagate repository errors', async () => {
    // Set up mock to throw error
    const error = new Error('Database connection failed');
    mockRepository.findLatest.mockRejectedValue(error);
    
    // Execute and expect error
    await expect(action.execute()).rejects.toThrow('Database connection failed');
    
    // Assert repository was called
    expect(mockRepository.findLatest).toHaveBeenCalledWith();
  });
  
  it('should handle different month data correctly', async () => {
    // Set up test data with different values
    const latestMonth = new Month({
      id: 1,
      month: 1,
      year: 2024,
      notes: 'January month',
      totalIncome: 0,
      totalExpenses: 1000,
      recurringExpenses: 500
    });
    
    // Set up mock
    mockRepository.findLatest.mockResolvedValue(latestMonth);
    
    // Execute
    const result = await action.execute();
    
    // Assert
    expect(result.id).toBe(1);
    expect(result.month).toBe(1);
    expect(result.year).toBe(2024);
    expect(result.notes).toBe('January month');
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(1000);
    expect(result.recurringExpenses).toBe(500);
  });
  
  it('should handle month with undefined notes', async () => {
    // Set up test data with undefined notes
    const latestMonth = new Month({
      id: 2,
      month: 6,
      year: 2023,
      notes: undefined,
      totalIncome: 5000,
      totalExpenses: 3000,
      recurringExpenses: 0
    });
    
    // Set up mock
    mockRepository.findLatest.mockResolvedValue(latestMonth);
    
    // Execute
    const result = await action.execute();
    
    // Assert
    expect(result.notes).toBeUndefined();
    expect(result.recurringExpenses).toBe(0);
  });
});
