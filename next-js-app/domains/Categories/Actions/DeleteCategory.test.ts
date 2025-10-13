import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteCategory } from './DeleteCategory';
import { Category } from '../Category';
import { CategoryNotFoundException, CategoryHasTransactionsException } from '../CategoryException';
import type { ICategoryRepository } from '../ICategoryRepository';

describe('DeleteCategory', () => {
  const mockRepository: ICategoryRepository = {
    index: vi.fn(),
    show: vi.fn(),
    store: vi.fn(),
    destroy: vi.fn(),
    findByName: vi.fn(),
    hasTransactions: vi.fn()
  };
  
  const deleteCategory = new DeleteCategory(mockRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should delete a category without transactions', async () => {
    // Set up mocks
    const testCategory = new Category({
      id: 1,
      name: 'Food',
      type: 'expense'
    });
    
    mockRepository.show = vi.fn().mockResolvedValue(testCategory);
    mockRepository.hasTransactions = vi.fn().mockResolvedValue({ hasTransactions: false, count: 0 });
    mockRepository.destroy = vi.fn().mockResolvedValue(undefined);
    
    // Execute
    await deleteCategory.execute(1);
    
    // Assert
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.hasTransactions).toHaveBeenCalledWith(1);
    expect(mockRepository.destroy).toHaveBeenCalledWith(1);
  });
  
  it('should throw CategoryNotFoundException when category does not exist', async () => {
    // Set up mocks
    mockRepository.show = vi.fn().mockResolvedValue(null);
    
    // Execute & Assert
    await expect(deleteCategory.execute(999)).rejects.toThrow(CategoryNotFoundException);
    
    expect(mockRepository.show).toHaveBeenCalledWith(999);
    expect(mockRepository.hasTransactions).not.toHaveBeenCalled();
    expect(mockRepository.destroy).not.toHaveBeenCalled();
  });
  
  it('should throw CategoryHasTransactionsException when category has transactions', async () => {
    // Set up mocks
    const testCategory = new Category({
      id: 1,
      name: 'Food',
      type: 'expense'
    });
    
    mockRepository.show = vi.fn().mockResolvedValue(testCategory);
    mockRepository.hasTransactions = vi.fn().mockResolvedValue({ hasTransactions: true, count: 5 });
    
    // Execute & Assert
    await expect(deleteCategory.execute(1)).rejects.toThrow(CategoryHasTransactionsException);
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.hasTransactions).toHaveBeenCalledWith(1);
    expect(mockRepository.destroy).not.toHaveBeenCalled();
  });
});
