import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreMonth } from './StoreMonth';
import { Month } from '../Month';
import { MonthAlreadyExistsException } from '../MonthException';
import type { IMonthRepository } from '../IMonthRepository';

describe('StoreMonth', () => {
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
  
  const mockApplyRecurringTransactions = vi.fn();
  const storeMonth = new StoreMonth(
    mockRepository as unknown as IMonthRepository,
    mockApplyRecurringTransactions
  );
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('stores a new month successfully', async () => {
    mockRepository.findByMonthAndYear.mockResolvedValue(false);
    
    const expectedMonth = new Month({
      id: 1,
      month: 3,
      year: 2023,
      notes: 'Test month'
    });
    
    mockRepository.store.mockResolvedValue(expectedMonth);
    
    const result = await storeMonth.execute({
      month: 3,
      year: 2023,
      notes: 'Test month'
    });
    
    expect(mockRepository.findByMonthAndYear).toHaveBeenCalledWith(3, 2023);
    expect(mockRepository.store).toHaveBeenCalled();
    expect(result).toBe(expectedMonth);
    expect(mockApplyRecurringTransactions).toHaveBeenCalledWith(1, 3, 2023);
  });
  
  it('throws MonthAlreadyExistsException when month exists', async () => {
    mockRepository.findByMonthAndYear.mockResolvedValue(true);
    
    await expect(storeMonth.execute({
      month: 3,
      year: 2023,
      notes: 'Test month'
    })).rejects.toThrow(MonthAlreadyExistsException);
    
    expect(mockRepository.store).not.toHaveBeenCalled();
    expect(mockApplyRecurringTransactions).not.toHaveBeenCalled();
  });
  
  it('stores a month successfully even if applying recurring transactions fails', async () => {
    mockRepository.findByMonthAndYear.mockResolvedValue(false);
    
    const expectedMonth = new Month({
      id: 1,
      month: 4,
      year: 2023,
      notes: 'Test month'
    });
    
    mockRepository.store.mockResolvedValue(expectedMonth);
    mockApplyRecurringTransactions.mockRejectedValue(new Error('Failed to apply recurring transactions'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const result = await storeMonth.execute({
      month: 4,
      year: 2023,
      notes: 'Test month'
    });
    
    expect(mockRepository.store).toHaveBeenCalled();
    expect(result).toBe(expectedMonth);
    expect(mockApplyRecurringTransactions).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
}); 