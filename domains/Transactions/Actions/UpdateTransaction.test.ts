import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateTransaction } from './UpdateTransaction';
import { TransactionNotFoundException } from '../TransactionException';
import { UpdateTransactionDTO } from '../TransactionDTO';
import { TransactionModel } from '../TransactionModel';
import { TransactionType } from '../Transaction';
import type { ITransactionRepository } from '../ITransactionRepository';
import type { CurrencyService } from '@/domains/Currency/Service/CurrencyService';

describe('UpdateTransaction', () => {
  // Create mock repository and service
  const mockRepository = {
    index: vi.fn(),
    show: vi.fn(),
    store: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    findByCategory: vi.fn(),
    getSpendingByCategory: vi.fn()
  };

  const mockCurrencyService = {
    processCurrencyAmounts: vi.fn()
  };

  const action = new UpdateTransaction(
    mockRepository as unknown as ITransactionRepository,
    mockCurrencyService as unknown as CurrencyService
  );

  const existingTransaction = {
    id: 1,
    name: 'Grocery Shopping',
    amountCAD: 100,
    amountUSD: 75,
    categoryId: 1,
    notes: 'Weekly groceries',
    type: TransactionType.EXPENSE,
    date: new Date('2023-07-15'),
    monthId: 1,
    clerkId: 'user123'
  } as TransactionModel;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update transaction successfully with all fields', async () => {
    const updateData: UpdateTransactionDTO = {
      name: 'Updated Grocery Shopping',
      amountCAD: 120,
      amountUSD: 90,
      categoryId: 2,
      notes: 'Updated notes',
      type: TransactionType.EXPENSE
    };

    const updatedTransaction = {
      ...existingTransaction,
      ...updateData
    };

    // Set up mocks
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockCurrencyService.processCurrencyAmounts.mockResolvedValue({
      amountCAD: 120,
      amountUSD: 90
    });
    mockRepository.update.mockResolvedValue(updatedTransaction);

    // Execute
    const result = await action.execute(1, updateData);

    // Assert
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(120, 90);
    expect(mockRepository.update).toHaveBeenCalledWith(1, {
      name: 'Updated Grocery Shopping',
      categoryId: 2,
      notes: 'Updated notes',
      type: TransactionType.EXPENSE,
      amountCAD: 120,
      amountUSD: 90
    });
    expect(result).toBe(updatedTransaction);
  });

  it('should update transaction with only name and category', async () => {
    const updateData: UpdateTransactionDTO = {
      name: 'New Name',
      categoryId: 3
    };

    const updatedTransaction = {
      ...existingTransaction,
      name: 'New Name',
      categoryId: 3
    };

    // Set up mocks
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockRepository.update.mockResolvedValue(updatedTransaction);

    // Execute
    const result = await action.execute(1, updateData);

    // Assert
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockCurrencyService.processCurrencyAmounts).not.toHaveBeenCalled();
    expect(mockRepository.update).toHaveBeenCalledWith(1, {
      name: 'New Name',
      categoryId: 3,
      notes: undefined,
      type: undefined
    });
    expect(result).toBe(updatedTransaction);
  });

  it('should handle null notes by converting to undefined', async () => {
    const updateData: UpdateTransactionDTO = {
      name: 'Updated Name',
      notes: null
    };

    // Set up mocks
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockRepository.update.mockResolvedValue(existingTransaction);

    // Execute
    await action.execute(1, updateData);

    // Assert
    expect(mockRepository.update).toHaveBeenCalledWith(1, {
      name: 'Updated Name',
      notes: null
    });
  });

  it('should handle removing USD amount when explicitly set to null', async () => {
    const updateData: UpdateTransactionDTO = {
      amountCAD: 150,
      amountUSD: null
    };

    // Set up mocks
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockRepository.update.mockResolvedValue(existingTransaction);

    // Execute
    await action.execute(1, updateData);

    // Assert
    expect(mockCurrencyService.processCurrencyAmounts).not.toHaveBeenCalled();
    expect(mockRepository.update).toHaveBeenCalledWith(1, {
      amountCAD: 150,
      amountUSD: null
    });
  });

  it('should update only CAD amount without USD', async () => {
    const updateData: UpdateTransactionDTO = {
      amountCAD: 200
    };

    // Set up mocks
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockCurrencyService.processCurrencyAmounts.mockResolvedValue({
      amountCAD: 200,
      amountUSD: undefined
    });
    mockRepository.update.mockResolvedValue(existingTransaction);

    // Execute
    await action.execute(1, updateData);

    // Assert
    expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(200, undefined);
    expect(mockRepository.update).toHaveBeenCalledWith(1, {
      amountCAD: 200,
      amountUSD: null
    });
  });

  it('should update only USD amount without CAD', async () => {
    const updateData: UpdateTransactionDTO = {
      amountUSD: 50
    };

    // Set up mocks
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockCurrencyService.processCurrencyAmounts.mockResolvedValue({
      amountCAD: 67.5,
      amountUSD: 50
    });
    mockRepository.update.mockResolvedValue(existingTransaction);

    // Execute
    await action.execute(1, updateData);

    // Assert
    expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(undefined, 50);
    expect(mockRepository.update).toHaveBeenCalledWith(1, {
      name: undefined,
      categoryId: undefined,
      notes: undefined,
      type: undefined,
      amountCAD: 67.5,
      amountUSD: 50
    });
  });

  it('should throw TransactionNotFoundException when transaction not found', async () => {
    const updateData: UpdateTransactionDTO = {
      name: 'Updated Name'
    };

    // Set up mocks
    mockRepository.show.mockResolvedValue(null);

    // Execute and expect error
    await expect(action.execute(999, updateData)).rejects.toThrow(TransactionNotFoundException);

    // Assert
    expect(mockRepository.show).toHaveBeenCalledWith(999);
    expect(mockRepository.update).not.toHaveBeenCalled();
    expect(mockCurrencyService.processCurrencyAmounts).not.toHaveBeenCalled();
  });

  it('should propagate currency service errors', async () => {
    const updateData: UpdateTransactionDTO = {
      amountCAD: 100,
      amountUSD: 75
    };

    const currencyError = new Error('Currency conversion failed');

    // Set up mocks
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockCurrencyService.processCurrencyAmounts.mockRejectedValue(currencyError);

    // Execute and expect error
    await expect(action.execute(1, updateData)).rejects.toThrow('Currency conversion failed');

    // Assert
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(100, 75);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should propagate repository update errors', async () => {
    const updateData: UpdateTransactionDTO = {
      name: 'Updated Name'
    };

    const repositoryError = new Error('Database update failed');

    // Set up mocks
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockRepository.update.mockRejectedValue(repositoryError);

    // Execute and expect error
    await expect(action.execute(1, updateData)).rejects.toThrow('Database update failed');

    // Assert
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.update).toHaveBeenCalled();
  });

  it('should propagate repository show errors', async () => {
    const updateData: UpdateTransactionDTO = {
      name: 'Updated Name'
    };

    const repositoryError = new Error('Database connection failed');

    // Set up mocks
    mockRepository.show.mockRejectedValue(repositoryError);

    // Execute and expect error
    await expect(action.execute(1, updateData)).rejects.toThrow('Database connection failed');

    // Assert
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should handle transaction type changes', async () => {
    const updateData: UpdateTransactionDTO = {
      type: TransactionType.INCOME
    };

    // Set up mocks
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockRepository.update.mockResolvedValue(existingTransaction);

    // Execute
    await action.execute(1, updateData);

    // Assert
    expect(mockRepository.update).toHaveBeenCalledWith(1, {
      name: undefined,
      categoryId: undefined,
      notes: undefined,
      type: TransactionType.INCOME
    });
  });
});
