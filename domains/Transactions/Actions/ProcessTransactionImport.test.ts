import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessTransactionImport } from './ProcessTransactionImport';
import { ImportTransactions } from './ImportTransactions';
import { BatchStoreTransactions } from './BatchStoreTransactions';
import { TransactionImportDTO } from '../DTOs/TransactionImportDTO';
import { TransactionType } from '../Entities/Transaction';

describe('ProcessTransactionImport', () => {
  let importTransactions: ImportTransactions;
  let batchStoreTransactions: BatchStoreTransactions;
  let action: ProcessTransactionImport;

  beforeEach(() => {
    importTransactions = {
      execute: vi.fn(),
    } as unknown as ImportTransactions;
    
    batchStoreTransactions = {
      execute: vi.fn(),
    } as unknown as BatchStoreTransactions;
    
    action = new ProcessTransactionImport(importTransactions, batchStoreTransactions);
  });

  it('processes transaction import successfully', async () => {
    const transactions: TransactionImportDTO[] = [
      {
        clerkId: 'user_123',
        name: 'Grocery Shopping',
        amountCAD: 100,
        categoryId: 1,
        type: TransactionType.EXPENSE,
        date: new Date('2025-01-01'),
        monthId: 1,
      },
      {
        clerkId: 'user_123',
        name: 'Salary',
        amountCAD: 5000,
        categoryId: 2,
        type: TransactionType.INCOME,
        date: new Date('2025-01-01'),
        monthId: 1,
      },
    ];

    const mockImportResult = {
      validTransactions: transactions,
      errors: [],
    };

    const mockStoreResult = {
      successCount: 2,
      failedCount: 0,
      totalCount: 2,
      errors: [],
      transactions: transactions,
    };

    vi.mocked(importTransactions.execute).mockResolvedValue(mockImportResult);
    vi.mocked(batchStoreTransactions.execute).mockResolvedValue(mockStoreResult);

    const result = await action.execute({
      csvContent: 'test-csv',
      clerkId: 'user_123',
    });

    expect(result.success).toBe(true);
    expect(result.successCount).toBe(2);
    expect(result.failedCount).toBe(0);
    expect(importTransactions.execute).toHaveBeenCalledWith({
      csvContent: 'test-csv',
      clerkId: 'user_123',
      headerMapping: undefined,
    });
    expect(batchStoreTransactions.execute).toHaveBeenCalledWith(transactions);
  });

  it('handles import failures gracefully', async () => {
    const mockImportResult = {
      validTransactions: [],
      errors: [
        {
          row: 1,
          message: 'Invalid CSV format',
        },
      ],
    };

    vi.mocked(importTransactions.execute).mockResolvedValue(mockImportResult);

    const result = await action.execute({
      csvContent: 'invalid-csv',
      clerkId: 'user_123',
    });

    expect(result.success).toBe(false);
    expect(result.successCount).toBe(0);
    expect(result.failedCount).toBe(1);
    expect(result.message).toBe('Import failed. No transactions were imported.');
  });
});
