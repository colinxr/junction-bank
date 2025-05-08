import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DestroyMonth } from './DestroyMonth';
import { Month } from '../Month';
import { MonthNotFoundException, MonthHasTransactionsException } from '../MonthException';
import type { IMonthRepository } from '../IMonthRepository';

describe('DestroyMonth', () => {
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
  
  const destroyMonth = new DestroyMonth(mockRepository as unknown as IMonthRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('successfully deletes a month that exists and has no transactions', async () => {
    const testMonth = new Month({
      id: 1,
      month: 3,
      year: 2023,
      notes: 'Test month'
    });
    
    mockRepository.show.mockResolvedValue(testMonth);
    mockRepository.hasTransactions.mockResolvedValue({ hasTransactions: false, count: 0 });
    
    await destroyMonth.execute(1);
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.hasTransactions).toHaveBeenCalledWith(1);
    expect(mockRepository.destroy).toHaveBeenCalledWith(1);
  });
  
  it('throws MonthNotFoundException when month does not exist', async () => {
    mockRepository.show.mockResolvedValue(null);
    
    await expect(destroyMonth.execute(999))
      .rejects.toThrow(MonthNotFoundException);
    
    expect(mockRepository.show).toHaveBeenCalledWith(999);
    expect(mockRepository.hasTransactions).not.toHaveBeenCalled();
    expect(mockRepository.destroy).not.toHaveBeenCalled();
  });
  
  it('throws MonthHasTransactionsException when month has transactions', async () => {
    const testMonth = new Month({
      id: 1,
      month: 3,
      year: 2023,
      notes: 'Test month'
    });
    
    mockRepository.show.mockResolvedValue(testMonth);
    mockRepository.hasTransactions.mockResolvedValue({ hasTransactions: true, count: 5 });
    
    await expect(destroyMonth.execute(1))
      .rejects.toThrow(MonthHasTransactionsException);
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.hasTransactions).toHaveBeenCalledWith(1);
    expect(mockRepository.destroy).not.toHaveBeenCalled();
  });
}); 