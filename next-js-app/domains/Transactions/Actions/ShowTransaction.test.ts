import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShowTransaction } from './ShowTransaction';
import { ITransactionRepository } from '../Repositories/ITransactionRepository';

describe('ShowTransaction', () => {
  let transactionRepository: ITransactionRepository;
  let action: ShowTransaction;

  beforeEach(() => {
    transactionRepository = {
      show: vi.fn(),
      index: vi.fn(),
      store: vi.fn(),
      update: vi.fn(),
      destroy: vi.fn(),
      importTransactions: vi.fn(),
      getTotalSpendingByCategory: vi.fn(),
      getUSDSpendingByCategory: vi.fn(),
    };
    action = new ShowTransaction(transactionRepository);
  });

  it('returns a transaction when it exists', async () => {
    const mockTransaction = {
      id: 1,
      name: 'Test Transaction',
      amountCAD: 100,
      categoryId: 1,
      type: 'Expense',
      date: new Date('2025-01-01'),
      monthId: 1,
      clerkId: 'user_123',
      notes: null,
      amountUSD: null,
      createdAt: new Date('2025-01-01'),
    } as any;

    vi.mocked(transactionRepository.show).mockResolvedValue(mockTransaction);

    const result = await action.execute(1);

    expect(result).toEqual(mockTransaction);
    expect(transactionRepository.show).toHaveBeenCalledWith(1);
  });

  it('throws an error when transaction does not exist', async () => {
    vi.mocked(transactionRepository.show).mockResolvedValue(null);

    await expect(action.execute(999)).rejects.toThrow('Transaction with ID 999 not found');
    expect(transactionRepository.show).toHaveBeenCalledWith(999);
  });
}); 