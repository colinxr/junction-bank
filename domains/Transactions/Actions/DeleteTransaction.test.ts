import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteTransaction } from './DeleteTransaction';
import { TransactionNotFoundException } from '../Exceptions/TransactionException';
import type { ITransactionRepository } from '../Repositories/ITransactionRepository';
import { TransactionModel } from '../Entities/TransactionModel';

describe('DeleteTransaction', () => {
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
  
  const deleteTransaction = new DeleteTransaction(mockRepository as unknown as ITransactionRepository);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('deletes a transaction when it exists', async () => {
    const testDate = new Date('2023-01-01');
    const testTransaction = {
      id: 1,
      clerkId: 'user123',
      name: 'Groceries',
      amountCAD: 50,
      categoryId: 1,
      type: 'Expense',
      date: testDate,
      monthId: 202301
    } as unknown as TransactionModel;
    
    mockRepository.show.mockResolvedValue(testTransaction);
    mockRepository.destroy.mockResolvedValue(undefined);
    
    await deleteTransaction.execute(1);
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.destroy).toHaveBeenCalledWith(1);
  });
  
  it('throws TransactionNotFoundException when transaction not found', async () => {
    mockRepository.show.mockResolvedValue(null);
    
    await expect(deleteTransaction.execute(999))
      .rejects.toThrow(TransactionNotFoundException);
    
    expect(mockRepository.show).toHaveBeenCalledWith(999);
    expect(mockRepository.destroy).not.toHaveBeenCalled();
  });
}); 