import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateTransaction } from './UpdateTransaction';
import { ITransactionRepository } from '../Repositories/ITransactionRepository';
import { UpdateTransactionDTO } from '../DTOs/TransactionDTO';

describe('UpdateTransaction', () => {
  let transactionRepository: ITransactionRepository;
  let action: UpdateTransaction;

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
    action = new UpdateTransaction(transactionRepository);
  });

  it('updates a transaction successfully', async () => {
    const updateData: UpdateTransactionDTO = {
      name: 'Updated Transaction',
      amountCAD: 150,
      notes: 'Updated notes',
    };

    const updatedTransaction = {
      id: 1,
      name: 'Updated Transaction',
      amountCAD: 150,
      notes: 'Updated notes',
      type: 'Expense',
      categoryId: 1,
      monthId: 1,
      clerkId: 'user_123',
      date: new Date('2025-01-01'),
      createdAt: new Date('2025-01-01'),
    } as any;

    vi.mocked(transactionRepository.update).mockResolvedValue(updatedTransaction);

    const result = await action.execute(1, updateData);

    expect(result).toEqual(updatedTransaction);
    expect(transactionRepository.update).toHaveBeenCalledWith(1, {
      name: 'Updated Transaction',
      amountCAD: 150,
      notes: 'Updated notes',
    });
  });

  it('handles partial updates', async () => {
    const updateData: UpdateTransactionDTO = {
      amountCAD: 200,
    };

    const updatedTransaction = {
      id: 1,
      name: 'Test Transaction',
      amountCAD: 200,
      type: 'Expense',
      categoryId: 1,
      monthId: 1,
      clerkId: 'user_123',
      date: new Date('2025-01-01'),
      createdAt: new Date('2025-01-01'),
    } as any;

    vi.mocked(transactionRepository.update).mockResolvedValue(updatedTransaction);

    const result = await action.execute(1, updateData);

    expect(result).toEqual(updatedTransaction);
    expect(transactionRepository.update).toHaveBeenCalledWith(1, {
      amountCAD: 200,
    });
  });
});
