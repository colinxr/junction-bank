import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProcessTransactionImport } from './ProcessTransactionImport';
import { ImportTransactions } from './ImportTransactions';
import { BatchStoreTransactions, BatchStoreResult } from './BatchStoreTransactions';
import { TransactionImportDTO, ImportError } from '../TransactionImportDTO';
import { TransactionType } from '../Transaction';
import { TransactionModel } from '../TransactionModel';

describe('ProcessTransactionImport', () => {
  let importTransactions: ImportTransactions;
  let batchStoreTransactions: BatchStoreTransactions;
  let action: ProcessTransactionImport;
  
  beforeEach(() => {
    // Create mocks
    importTransactions = {
      execute: vi.fn(),
    } as unknown as ImportTransactions;
    
    batchStoreTransactions = {
      execute: vi.fn(),
    } as unknown as BatchStoreTransactions;
    
    action = new ProcessTransactionImport(
      importTransactions,
      batchStoreTransactions
    );
  });
  
  it('should successfully process import with valid transactions', async () => {
    const validTransactions: TransactionImportDTO[] = [
      {
        clerkId: 'user123',
        name: 'Grocery Shopping',
        amountCAD: 125.50,
        categoryId: 1,
        notes: 'Weekly groceries',
        type: TransactionType.EXPENSE,
        date: new Date('2023-07-15'),
        monthId: 1
      },
      {
        clerkId: 'user123',
        name: 'Salary',
        amountCAD: 3000,
        categoryId: 2,
        notes: 'Monthly salary',
        type: TransactionType.INCOME,
        date: new Date('2023-07-20'),
        monthId: 1
      }
    ];
    
    const importErrors: ImportError[] = [
      {
        row: 3,
        message: 'Invalid date format: bad-date',
        originalData: { date: 'bad-date', name: 'Test', amount_cad: '100' }
      }
    ];
    
    const storeResult: BatchStoreResult = {
      successCount: 2,
      failedCount: 0,
      totalCount: 2,
      errors: [],
      transactions: [
        { id: 1, name: 'Grocery Shopping' } as TransactionModel,
        { id: 2, name: 'Salary' } as TransactionModel
      ]
    };
    
    // Setup mocks
    importTransactions.execute = vi.fn().mockResolvedValue({
      validTransactions,
      errors: importErrors
    });
    
    batchStoreTransactions.execute = vi.fn().mockResolvedValue(storeResult);
    
    // Execute action
    const result = await action.execute({
      csvContent: 'csv-content-here',
      clerkId: 'user123'
    });
    
    // Verify import action was called
    expect(importTransactions.execute).toHaveBeenCalledWith({
      csvContent: 'csv-content-here',
      clerkId: 'user123',
      headerMapping: undefined
    });
    
    // Verify batch store was called with valid transactions
    expect(batchStoreTransactions.execute).toHaveBeenCalledWith(validTransactions);
    
    // Verify result
    expect(result).toEqual({
      success: true,
      message: 'Successfully imported 2 transactions.',
      successCount: 2,
      failedCount: 1, // 1 import error
      totalCount: 3, // 2 valid + 1 error
      errors: importErrors
    });
  });
  
  it('should handle import with no valid transactions', async () => {
    const importErrors: ImportError[] = [
      {
        row: 1,
        message: 'Missing required fields (date, name, or amount_cad)',
        originalData: { date: '', name: '', amount_cad: '' }
      },
      {
        row: 2,
        message: 'Invalid amount format: not-a-number',
        originalData: { date: '2023-07-15', name: 'Test', amount_cad: 'not-a-number' }
      }
    ];
    
    // Setup mocks - no valid transactions
    importTransactions.execute = vi.fn().mockResolvedValue({
      validTransactions: [],
      errors: importErrors
    });
    
    // Execute action
    const result = await action.execute({
      csvContent: 'invalid-csv-content',
      clerkId: 'user123'
    });
    
    // Verify import action was called
    expect(importTransactions.execute).toHaveBeenCalledWith({
      csvContent: 'invalid-csv-content',
      clerkId: 'user123',
      headerMapping: undefined
    });
    
    // Verify batch store was not called
    expect(batchStoreTransactions.execute).not.toHaveBeenCalled();
    
    // Verify result
    expect(result).toEqual({
      success: false,
      message: 'Import failed. No transactions were imported.',
      successCount: 0,
      failedCount: 2,
      totalCount: 2,
      errors: importErrors
    });
  });
  
  it('should handle batch store failures and combine errors', async () => {
    const validTransactions: TransactionImportDTO[] = [
      {
        clerkId: 'user123',
        name: 'Grocery Shopping',
        amountCAD: 125.50,
        categoryId: 1,
        notes: 'Weekly groceries',
        type: TransactionType.EXPENSE,
        date: new Date('2023-07-15'),
        monthId: 1
      }
    ];
    
    const importErrors: ImportError[] = [];
    
    const storeResult: BatchStoreResult = {
      successCount: 0,
      failedCount: 1,
      totalCount: 1,
      errors: [
        {
          transaction: validTransactions[0],
          error: 'Database constraint violation'
        }
      ],
      transactions: []
    };
    
    // Setup mocks
    importTransactions.execute = vi.fn().mockResolvedValue({
      validTransactions,
      errors: importErrors
    });
    
    batchStoreTransactions.execute = vi.fn().mockResolvedValue(storeResult);
    
    // Execute action
    const result = await action.execute({
      csvContent: 'csv-content-here',
      clerkId: 'user123'
    });
    
    // Verify result includes converted batch store errors
    expect(result).toEqual({
      success: false,
      message: 'Import failed. No transactions were imported.',
      successCount: 0,
      failedCount: 0, // no import errors
      totalCount: 1,
      errors: [
        {
          message: 'Database constraint violation',
          originalData: {
            date: validTransactions[0].date.toISOString(),
            name: 'Grocery Shopping',
            amount_cad: '125.5',
            amount_usd: '',
            category_id: '1',
            notes: 'Weekly groceries'
          }
        }
      ]
    });
  });
  
  it('should handle partial success with both import and store errors', async () => {
    const validTransactions: TransactionImportDTO[] = [
      {
        clerkId: 'user123',
        name: 'Grocery Shopping',
        amountCAD: 125.50,
        categoryId: 1,
        notes: 'Weekly groceries',
        type: TransactionType.EXPENSE,
        date: new Date('2023-07-15'),
        monthId: 1
      },
      {
        clerkId: 'user123',
        name: 'Salary',
        amountCAD: 3000,
        categoryId: 2,
        notes: 'Monthly salary',
        type: TransactionType.INCOME,
        date: new Date('2023-07-20'),
        monthId: 1
      }
    ];
    
    const importErrors: ImportError[] = [
      {
        row: 3,
        message: 'Invalid date format: bad-date',
        originalData: { date: 'bad-date', name: 'Test', amount_cad: '100' }
      }
    ];
    
    const storeResult: BatchStoreResult = {
      successCount: 1,
      failedCount: 1,
      totalCount: 2,
      errors: [
        {
          transaction: validTransactions[1],
          error: 'Duplicate transaction detected'
        }
      ],
      transactions: [
        { id: 1, name: 'Grocery Shopping' } as TransactionModel
      ]
    };
    
    // Setup mocks
    importTransactions.execute = vi.fn().mockResolvedValue({
      validTransactions,
      errors: importErrors
    });
    
    batchStoreTransactions.execute = vi.fn().mockResolvedValue(storeResult);
    
    // Execute action
    const result = await action.execute({
      csvContent: 'csv-content-here',
      clerkId: 'user123'
    });
    
    // Verify result
    expect(result).toEqual({
      success: true,
      message: 'Successfully imported 1 transactions.',
      successCount: 1,
      failedCount: 2, // 1 import error + 1 store error
      totalCount: 3, // 2 valid + 1 import error
      errors: [
        importErrors[0],
        {
          message: 'Duplicate transaction detected',
          originalData: {
            date: validTransactions[1].date.toISOString(),
            name: 'Salary',
            amount_cad: '3000',
            amount_usd: '',
            category_id: '2',
            notes: 'Monthly salary'
          }
        }
      ]
    });
  });
  
  it('should pass custom header mapping to import action', async () => {
    const headerMapping = {
      'Transaction Date': 'date',
      'Merchant': 'name',
      'Amount (CAD)': 'amount_cad',
      'Category Number': 'category_id',
      'Comment': 'notes'
    };
    
    // Setup mocks with empty results
    importTransactions.execute = vi.fn().mockResolvedValue({
      validTransactions: [],
      errors: []
    });
    
    // Execute action with custom mapping
    await action.execute({
      csvContent: 'csv-content-here',
      clerkId: 'user123',
      headerMapping
    });
    
    // Verify import action was called with custom mapping
    expect(importTransactions.execute).toHaveBeenCalledWith({
      csvContent: 'csv-content-here',
      clerkId: 'user123',
      headerMapping
    });
  });
  
  it('should handle undefined amounts in store error conversion', async () => {
    const validTransactions: TransactionImportDTO[] = [
      {
        clerkId: 'user123',
        name: 'Test Transaction',
        amountCAD: undefined,
        amountUSD: 100,
        categoryId: 1,
        notes: undefined,
        type: TransactionType.EXPENSE,
        date: new Date('2023-07-15'),
        monthId: 1
      }
    ];
    
    const storeResult: BatchStoreResult = {
      successCount: 0,
      failedCount: 1,
      totalCount: 1,
      errors: [
        {
          transaction: validTransactions[0],
          error: 'Test error'
        }
      ],
      transactions: []
    };
    
    // Setup mocks
    importTransactions.execute = vi.fn().mockResolvedValue({
      validTransactions,
      errors: []
    });
    
    batchStoreTransactions.execute = vi.fn().mockResolvedValue(storeResult);
    
    // Execute action
    const result = await action.execute({
      csvContent: 'csv-content-here',
      clerkId: 'user123'
    });
    
    // Verify undefined values are handled correctly in error conversion
    expect(result.errors).toEqual([
      {
        message: 'Test error',
        originalData: {
          date: validTransactions[0].date.toISOString(),
          name: 'Test Transaction',
          amount_cad: '',
          amount_usd: '100',
          category_id: '1',
          notes: ''
        }
      }
    ]);
  });
  
  it('should propagate errors from import action', async () => {
    const error = new Error('Import action failed');
    
    // Setup mock to throw error
    importTransactions.execute = vi.fn().mockRejectedValue(error);
    
    // Execute action and expect it to throw
    await expect(action.execute({
      csvContent: 'invalid-content',
      clerkId: 'user123'
    })).rejects.toThrow('Import action failed');
  });
  
  it('should propagate errors from batch store action', async () => {
    const validTransactions: TransactionImportDTO[] = [
      {
        clerkId: 'user123',
        name: 'Test',
        amountCAD: 100,
        categoryId: 1,
        notes: '',
        type: TransactionType.EXPENSE,
        date: new Date('2023-07-15'),
        monthId: 1
      }
    ];
    
    const error = new Error('Batch store failed');
    
    // Setup mocks
    importTransactions.execute = vi.fn().mockResolvedValue({
      validTransactions,
      errors: []
    });
    
    batchStoreTransactions.execute = vi.fn().mockRejectedValue(error);
    
    // Execute action and expect it to throw
    await expect(action.execute({
      csvContent: 'content',
      clerkId: 'user123'
    })).rejects.toThrow('Batch store failed');
  });
});
