import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreTransaction } from './StoreTransaction';
import { ITransactionRepository } from '../Repositories/ITransactionRepository';
import { TransactionCreateDTO } from '../DTOs/TransactionDTO';

describe('StoreTransaction', () => {
  let transactionRepository: ITransactionRepository;
  let action: StoreTransaction;

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
    action = new StoreTransaction(transactionRepository);
  });

  it('stores a transaction successfully', async () => {
    const transactionData: TransactionCreateDTO = {
      clerkId: 'user_123',
      name: 'Test Transaction',
      amountCAD: 100,
      categoryId: 1,
      notes: 'Test notes',
      type: 'Expense',
      date: '2025-01-01T00:00:00.000Z',
      monthId: 1,
    };

    const expectedTransactionData = {
      clerkId: 'user_123',
      name: 'Test Transaction',
      amountCAD: 100,
      categoryId: 1,
      notes: 'Test notes',
      type: 'Expense',
      date: new Date('2025-01-01T00:00:00.000Z'),
      monthId: 1,
    };

    const savedTransaction = { ...expectedTransactionData, id: 1 } as any;

    vi.mocked(transactionRepository.store).mockResolvedValue(savedTransaction);

    const result = await action.execute(transactionData);

    expect(result).toEqual(savedTransaction);
    expect(transactionRepository.store).toHaveBeenCalledWith(expectedTransactionData);
  });

  it('handles transaction with USD amount', async () => {
    const transactionData: TransactionCreateDTO = {
      clerkId: 'user_123',
      name: 'USD Transaction',
      amountUSD: 75,
      categoryId: 1,
      notes: null,
      type: 'Expense',
      date: '2025-01-01T00:00:00.000Z',
      monthId: 1,
    };

    const expectedTransactionData = {
      clerkId: 'user_123',
      name: 'USD Transaction',
      amountUSD: 75,
      categoryId: 1,
      notes: null,
      type: 'Expense',
      date: new Date('2025-01-01T00:00:00.000Z'),
      monthId: 1,
    };

    const savedTransaction = { ...expectedTransactionData, id: 2 } as any;

    vi.mocked(transactionRepository.store).mockResolvedValue(savedTransaction);

    const result = await action.execute(transactionData);

    expect(result).toEqual(savedTransaction);
    expect(transactionRepository.store).toHaveBeenCalledWith(expectedTransactionData);
  });

  it('handles transaction with both CAD and USD amounts', async () => {
    const transactionData: TransactionCreateDTO = {
      clerkId: 'user_123',
      name: 'Dual Currency Transaction',
      amountCAD: 100,
      amountUSD: 75,
      categoryId: 1,
      notes: 'Test notes',
      type: 'Income',
      date: '2025-01-01T00:00:00.000Z',
      monthId: 1,
    };

    const expectedTransactionData = {
      clerkId: 'user_123',
      name: 'Dual Currency Transaction',
      amountCAD: 100,
      amountUSD: 75,
      categoryId: 1,
      notes: 'Test notes',
      type: 'Income',
      date: new Date('2025-01-01T00:00:00.000Z'),
      monthId: 1,
    };

    const savedTransaction = { ...expectedTransactionData, id: 3 } as any;

    vi.mocked(transactionRepository.store).mockResolvedValue(savedTransaction);

    const result = await action.execute(transactionData);

    expect(result).toEqual(savedTransaction);
    expect(transactionRepository.store).toHaveBeenCalledWith(expectedTransactionData);
  });
}); 