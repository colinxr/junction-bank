import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShowMonth } from './ShowMonth';
import { Month } from '../Month';
import { MonthNotFoundException } from '../MonthException';
import type { IMonthRepository } from '../IMonthRepository';

describe('ShowMonth', () => {
  // Create mock repository
  const mockRepository = {
    index: vi.fn(),
    show: vi.fn(),
    findByDate: vi.fn(),
    store: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    findByMonthAndYear: vi.fn(),
    hasTransactions: vi.fn()
  };
  
  const showMonth = new ShowMonth(mockRepository as unknown as IMonthRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('returns a month when it exists', async () => {
    const testMonth = new Month({
      id: 1,
      month: 3,
      year: 2023,
      notes: 'Test month',
      totalIncome: 5000,
      totalExpenses: 3000,
      recurringExpenses: 1500
    });
    
    mockRepository.show.mockResolvedValue(testMonth);
    
    const result = await showMonth.execute(1);
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(result).toBe(testMonth);
  });
  
  it('throws MonthNotFoundException when month not found', async () => {
    mockRepository.show.mockResolvedValue(null);
    
    await expect(showMonth.execute(999))
      .rejects.toThrow(MonthNotFoundException);
  });
}); 