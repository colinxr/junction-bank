import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteTransaction } from './DeleteTransaction';
import { ITransactionRepository } from '../Repositories/ITransactionRepository';

describe('DeleteTransaction', () => {
  let transactionRepository: ITransactionRepository;
  let action: DeleteTransaction;

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
    action = new DeleteTransaction(transactionRepository);
  });

  it('deletes a transaction successfully', async () => {
    const mockTransaction = {
      id: 1,
      name: 'Test Transaction',
      monthId: 1,
    } as any;

    vi.mocked(transactionRepository.show).mockResolvedValue(mockTransaction);
    vi.mocked(transactionRepository.destroy).mockResolvedValue();

    await action.execute(1);

    expect(transactionRepository.show).toHaveBeenCalledWith(1);
    expect(transactionRepository.destroy).toHaveBeenCalledWith(1);
  });

  it('throws an error when transaction does not exist', async () => {
    vi.mocked(transactionRepository.show).mockResolvedValue(null);

    await expect(action.execute(999)).rejects.toThrow('Transaction with ID 999 not found');
    expect(transactionRepository.show).toHaveBeenCalledWith(999);
    expect(transactionRepository.destroy).not.toHaveBeenCalled();
  });
}); 