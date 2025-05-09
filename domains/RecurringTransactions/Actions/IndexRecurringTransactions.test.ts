import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndexRecurringTransactions } from './IndexRecurringTransactions';
import { RecurringTransaction, TransactionType } from '../RecurringTransaction';
import type { IRecurringTransactionRepository } from '../IRecurringTransactionRepository';

describe('IndexRecurringTransactions', () => {
  // Create mock repository
  const mockRepository = {
    index: vi.fn(),
    show: vi.fn(),
    store: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    findByName: vi.fn(),
    applyToMonth: vi.fn()
  };
  
  const indexRecurringTransactions = new IndexRecurringTransactions(
    mockRepository as unknown as IRecurringTransactionRepository
  );
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('returns all recurring transactions for a user', async () => {
    const testTransactions = [
      new RecurringTransaction({
        id: 1,
        userId: 'user123',
        name: 'Monthly Rent',
        amountCAD: 1500,
        categoryId: 2,
        type: TransactionType.EXPENSE
      }),
      new RecurringTransaction({
        id: 2,
        userId: 'user123',
        name: 'Salary',
        amountCAD: 4000,
        categoryId: 1,
        type: TransactionType.INCOME
      })
    ];
    
    const pagination = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 2,
      itemsPerPage: 10
    };
    
    mockRepository.index.mockResolvedValue({
      data: testTransactions,
      pagination
    });
    
    const result = await indexRecurringTransactions.execute();
    
    expect(mockRepository.index).toHaveBeenCalledWith();
    expect(result.data).toEqual(testTransactions);
    expect(result.pagination).toEqual(pagination);
  });
}); 