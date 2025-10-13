import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndexMonths } from './IndexMonths';
import { Month } from '../Month';
import type { IMonthRepository } from '../IMonthRepository';

describe('IndexMonths', () => {
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
  
  const indexMonths = new IndexMonths(mockRepository as unknown as IMonthRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('returns all months', async () => {
    const testMonths = [
      new Month({
        id: 1,
        month: 3,
        year: 2023,
        notes: 'March 2023'
      }),
      new Month({
        id: 2,
        month: 4,
        year: 2023,
        notes: 'April 2023'
      }),
      new Month({
        id: 3,
        month: 1,
        year: 2024,
        notes: 'January 2024'
      })
    ];
    
    const pagination = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 3,
      itemsPerPage: 10
    };
    
    mockRepository.index.mockResolvedValue({
      data: testMonths,
      pagination
    });
    
    const result = await indexMonths.execute();
    
    expect(mockRepository.index).toHaveBeenCalled();
    expect(result.data).toEqual(testMonths);
    expect(result.pagination).toEqual(pagination);
  });
}); 