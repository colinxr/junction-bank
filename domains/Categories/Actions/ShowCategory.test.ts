import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShowCategory } from './ShowCategory';
import { Category } from '../Category';
import { CategoryNotFoundException } from '../CategoryException';
import type { ICategoryRepository } from '../ICategoryRepository';

describe('ShowCategory', () => {
  // Create mock repository
  const mockRepository = {
    index: vi.fn(),
    show: vi.fn(),
    store: vi.fn(),
    destroy: vi.fn(),
    findByName: vi.fn(),
    hasTransactions: vi.fn()
  };
  
  const showCategory = new ShowCategory(mockRepository as unknown as ICategoryRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('returns a category when it exists', async () => {
    const testCategory = new Category({
      id: 1,
      name: 'Food',
      type: 'expense'
    });
    
    mockRepository.show.mockResolvedValue(testCategory);
    
    const result = await showCategory.execute(1);
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(result).toBe(testCategory);
  });
  
  it('throws CategoryNotFoundException when category not found', async () => {
    mockRepository.show.mockResolvedValue(null);
    
    await expect(showCategory.execute(999))
      .rejects.toThrow(CategoryNotFoundException);
  });
});
