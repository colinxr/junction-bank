import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FindMonthByDate } from './FindMonthByDate';
import { Month } from '../Month';
import type { IMonthRepository } from '../IMonthRepository';

describe('FindMonthByDate', () => {
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
  
  const findMonthByDate = new FindMonthByDate(mockRepository as unknown as IMonthRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('returns a month when it exists for the given date', async () => {
    const testDate = new Date('2023-03-15');
    const testMonth = new Month({
      id: 1,
      month: 3,
      year: 2023,
      notes: 'March 2023'
    });
    
    mockRepository.findByDate.mockResolvedValue(testMonth);
    
    const result = await findMonthByDate.execute(testDate);
    
    expect(mockRepository.findByDate).toHaveBeenCalledWith(3, 2023);
    expect(result).toBe(testMonth);
  });
  
  it('returns null when no month exists for the given date', async () => {
    const testDate = new Date('2023-05-10');
    
    mockRepository.findByDate.mockResolvedValue(null);
    
    const result = await findMonthByDate.execute(testDate);
    
    expect(mockRepository.findByDate).toHaveBeenCalledWith(5, 2023);
    expect(result).toBeNull();
  });
  
  it('handles month conversion correctly (JavaScript months are 0-based)', async () => {
    const testDate = new Date('2023-01-01'); // January (0 in JavaScript)
    
    mockRepository.findByDate.mockResolvedValue(null);
    
    await findMonthByDate.execute(testDate);
    
    expect(mockRepository.findByDate).toHaveBeenCalledWith(1, 2023); // Should be converted to 1 for January
  });
}); 