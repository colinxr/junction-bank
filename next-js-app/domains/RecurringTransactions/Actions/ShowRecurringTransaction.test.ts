import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShowRecurringTransaction } from './ShowRecurringTransaction';
import { RecurringTransaction, TransactionType } from '../RecurringTransaction';
import { RecurringTransactionNotFoundException } from '../RecurringTransactionException';
import type { IRecurringTransactionRepository } from '../IRecurringTransactionRepository';

describe('ShowRecurringTransaction', () => {
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
  
  const showRecurringTransaction = new ShowRecurringTransaction(
    mockRepository as unknown as IRecurringTransactionRepository
  );
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('returns a recurring transaction when it exists', async () => {
    const testTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      notes: 'Test notes',
      dayOfMonth: 1,
      type: TransactionType.EXPENSE
    });
    
    mockRepository.show.mockResolvedValue(testTransaction);
    
    const result = await showRecurringTransaction.execute(1);
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(result).toBe(testTransaction);
  });
  
  it('throws RecurringTransactionNotFoundException when transaction not found', async () => {
    mockRepository.show.mockResolvedValue(null);
    
    await expect(showRecurringTransaction.execute(999))
      .rejects.toThrow(RecurringTransactionNotFoundException);
    
    expect(mockRepository.show).toHaveBeenCalledWith(999);
  });
}); 