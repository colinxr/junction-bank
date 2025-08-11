import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndexTransactions } from './IndexTransactions';
import { ITransactionRepository } from '../Repositories/ITransactionRepository';

describe('IndexTransactions', () => {
  let transactionRepository: ITransactionRepository;
  let action: IndexTransactions;

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
    action = new IndexTransactions(transactionRepository);
  });

  it('returns all transactions when no monthId is provided', async () => {
    const mockTransactions = [
      { id: 1, name: 'Transaction 1' },
      { id: 2, name: 'Transaction 2' },
    ] as any[];

    vi.mocked(transactionRepository.index).mockResolvedValue(mockTransactions);

    const result = await action.execute();

    expect(result).toEqual(mockTransactions);
    expect(transactionRepository.index).toHaveBeenCalledWith(undefined);
  });

  it('returns transactions for a specific month', async () => {
    const mockTransactions = [
      { id: 1, name: 'Transaction 1', monthId: 1 },
      { id: 2, name: 'Transaction 2', monthId: 1 },
    ] as any[];

    vi.mocked(transactionRepository.index).mockResolvedValue(mockTransactions);

    const result = await action.execute(1);

    expect(result).toEqual(mockTransactions);
    expect(transactionRepository.index).toHaveBeenCalledWith(1);
  });
}); 