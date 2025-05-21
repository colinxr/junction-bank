import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndexTransactions } from './IndexTransactions';
import type { ITransactionRepository } from '../ITransactionRepository';
import { TransactionModel } from '../TransactionModel';

describe('IndexTransactions', () => {
  // Create mock repository
  const mockRepository = {
    index: vi.fn(),
    indexByCategory: vi.fn(),
    indexByMonth: vi.fn(),
    show: vi.fn(),
    store: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    getCategorySpending: vi.fn()
  };
  
  const indexTransactions = new IndexTransactions(mockRepository as unknown as ITransactionRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('returns all transactions when no monthId is provided', async () => {
    const testDate = new Date('2023-01-01');
    const transactions = [
      {
        id: 1,
        clerkId: 'user123',
        name: 'Groceries',
        amountCAD: 50,
        categoryId: 1,
        type: 'Expense',
        date: testDate,
        monthId: 202301
      },
      {
        id: 2,
        clerkId: 'user123',
        name: 'Rent',
        amountCAD: 1200,
        categoryId: 2,
        type: 'Expense',
        date: new Date('2023-02-01'),
        monthId: 202302
      }
    ] as unknown as TransactionModel[];
    
    mockRepository.index.mockResolvedValue(transactions);
    
    const result = await indexTransactions.execute();
    
    expect(mockRepository.index).toHaveBeenCalledWith(undefined);
    expect(result).toBe(transactions);
    expect(result.length).toBe(2);
  });
  
  it('returns transactions filtered by monthId when provided', async () => {
    const testDate = new Date('2023-01-01');
    const monthId = 202301;
    const transactions = [
      {
        id: 1,
        clerkId: 'user123',
        name: 'Groceries',
        amountCAD: 50,
        categoryId: 1,
        type: 'Expense',
        date: testDate,
        monthId: monthId
      }
    ] as unknown as TransactionModel[];
    
    mockRepository.index.mockResolvedValue(transactions);
    
    const result = await indexTransactions.execute(monthId);
    
    expect(mockRepository.index).toHaveBeenCalledWith(monthId);
    expect(result).toBe(transactions);
    expect(result.length).toBe(1);
  });
  
  it('returns empty array when no transactions found', async () => {
    mockRepository.index.mockResolvedValue([]);
    
    const result = await indexTransactions.execute();
    
    expect(mockRepository.index).toHaveBeenCalledWith(undefined);
    expect(result).toEqual([]);
  });
}); 