import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShowTransaction } from './ShowTransaction';
import { TransactionNotFoundException } from '../TransactionException';
import type { ITransactionRepository } from '../ITransactionRepository';
import { TransactionModel } from '../TransactionModel';

describe('ShowTransaction', () => {
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
  
  const showTransaction = new ShowTransaction(mockRepository as unknown as ITransactionRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('returns a transaction when it exists', async () => {
    const testDate = new Date('2023-01-01');
    const testTransaction = {
      id: 1,
      userId: 'user123',
      name: 'Groceries',
      amountCAD: 50,
      categoryId: 1,
      type: 'Expense',
      date: testDate,
      monthId: 202301
    } as unknown as TransactionModel;
    
    mockRepository.show.mockResolvedValue(testTransaction);
    
    const result = await showTransaction.execute(1);
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(result).toBe(testTransaction);
  });
  
  it('throws TransactionNotFoundException when transaction not found', async () => {
    mockRepository.show.mockResolvedValue(null);
    
    await expect(showTransaction.execute(999))
      .rejects.toThrow(TransactionNotFoundException);
  });
}); 