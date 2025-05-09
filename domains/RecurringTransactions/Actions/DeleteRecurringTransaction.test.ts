import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteRecurringTransaction } from './DeleteRecurringTransaction';
import { RecurringTransaction, TransactionType } from '../RecurringTransaction';
import { RecurringTransactionNotFoundException } from '../RecurringTransactionException';
import type { IRecurringTransactionRepository } from '../IRecurringTransactionRepository';

describe('DeleteRecurringTransaction', () => {
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
  
  const deleteRecurringTransaction = new DeleteRecurringTransaction(
    mockRepository as unknown as IRecurringTransactionRepository
  );
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('successfully deletes a recurring transaction that exists', async () => {
    const testTransaction = new RecurringTransaction({
      id: 1,
      userId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      type: TransactionType.EXPENSE
    });
    
    mockRepository.show.mockResolvedValue(testTransaction);
    
    await deleteRecurringTransaction.execute(1);
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.destroy).toHaveBeenCalledWith(1);
  });
  
  it('throws RecurringTransactionNotFoundException when transaction does not exist', async () => {
    mockRepository.show.mockResolvedValue(null);
    
    await expect(deleteRecurringTransaction.execute(999))
      .rejects.toThrow(RecurringTransactionNotFoundException);
    
    expect(mockRepository.show).toHaveBeenCalledWith(999);
    expect(mockRepository.destroy).not.toHaveBeenCalled();
  });
}); 