import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndexCategories } from './IndexCategories';
import { Category } from '../Category';
import type { ICategoryRepository } from '../ICategoryRepository';

describe('IndexCategories', () => {
  const mockRepository: ICategoryRepository = {
    index: vi.fn(),
    show: vi.fn(),
    store: vi.fn(),
    destroy: vi.fn(),
    findByName: vi.fn(),
    hasTransactions: vi.fn()
  };
  
  const indexCategories = new IndexCategories(mockRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should return all categories', async () => {
    // Set up mocks
    const testCategories = [
      new Category({
        id: 1,
        name: 'Food',
        type: 'expense'
      }),
      new Category({
        id: 2,
        name: 'Salary',
        type: 'income'
      })
    ];
    
    mockRepository.index = vi.fn().mockResolvedValue(testCategories);
    
    // Execute
    const result = await indexCategories.execute();
    
    // Assert
    expect(mockRepository.index).toHaveBeenCalled();
    expect(result).toEqual(testCategories);
  });
  
  it('should return empty array when no categories exist', async () => {
    // Set up mocks
    mockRepository.index = vi.fn().mockResolvedValue([]);
    
    // Execute
    const result = await indexCategories.execute();
    
    // Assert
    expect(mockRepository.index).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
