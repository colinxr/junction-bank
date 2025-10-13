import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreCategory } from './StoreCategory';
import { Category } from '../Category';
import { CategoryAlreadyExistsException } from '../CategoryException';
import type { ICategoryRepository } from '../ICategoryRepository';

describe('StoreCategory', () => {
  // Create mock repository
  const mockRepository = {
    index: vi.fn(),
    show: vi.fn(),
    store: vi.fn(),
    destroy: vi.fn(),
    findByName: vi.fn(),
    hasTransactions: vi.fn()
  };
  
  const storeCategory = new StoreCategory(mockRepository as unknown as ICategoryRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('stores a new category successfully', async () => {
    mockRepository.findByName.mockResolvedValue(false);
    
    const expectedCategory = new Category({
      id: 1,
      name: 'Food',
      type: 'expense'
    });
    
    mockRepository.store.mockResolvedValue(expectedCategory);
    
    const result = await storeCategory.execute({
      name: 'Food',
      type: 'expense'
    });
    
    expect(mockRepository.findByName).toHaveBeenCalledWith('Food');
    expect(mockRepository.store).toHaveBeenCalled();
    expect(result).toBe(expectedCategory);
  });
  
  it('throws CategoryAlreadyExistsException when category exists', async () => {
    mockRepository.findByName.mockResolvedValue(true);
    
    await expect(storeCategory.execute({
      name: 'Food',
      type: 'expense'
    })).rejects.toThrow(CategoryAlreadyExistsException);
    
    expect(mockRepository.store).not.toHaveBeenCalled();
  });
});