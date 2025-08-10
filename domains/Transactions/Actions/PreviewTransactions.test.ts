import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PreviewTransactions } from './PreviewTransactions';
import { TransactionImportService } from '../Services/TransactionImportService';
import { TransactionImportDTO, ImportError } from '../TransactionImportDTO';
import { TransactionType } from '../Transaction';

describe('PreviewTransactions', () => {
  let transactionImportService: TransactionImportService;
  let action: PreviewTransactions;
  
  beforeEach(() => {
    // Create mock for transaction import service
    transactionImportService = {
      parseCSV: vi.fn(),
    } as unknown as TransactionImportService;
    
    action = new PreviewTransactions(transactionImportService);
  });
  
  it('should parse CSV and return preview data with valid transactions', async () => {
    // Sample valid transactions
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
    
    const errors: ImportError[] = [
      {
        row: 3,
        message: 'Invalid date format: bad-date',
        originalData: { date: 'bad-date', name: 'Test', amount_cad: '100' }
      }
    ];
    
    // Setup mock
    transactionImportService.parseCSV = vi.fn().mockResolvedValue({
      validTransactions,
      errors
    });
    
    // Execute action
    const result = await action.execute({
      csvContent: 'csv-content-here',
      userId: 'user123'
    });
    
    // Verify service was called with correct parameters
    expect(transactionImportService.parseCSV).toHaveBeenCalledWith(
      'csv-content-here',
      'user123',
      {
        headerMapping: undefined,
        validateCategories: expect.any(Function)
      }
    );
    
    // Verify result structure
    expect(result).toEqual({
      transactions: validTransactions,
      errors,
      totalCount: 3 // 2 valid + 1 error
    });
  });
  
  it('should handle CSV with only errors and no valid transactions', async () => {
    const validTransactions: TransactionImportDTO[] = [];
    const errors: ImportError[] = [
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
    
    // Setup mock
    transactionImportService.parseCSV = vi.fn().mockResolvedValue({
      validTransactions,
      errors
    });
    
    // Execute action
    const result = await action.execute({
      csvContent: 'invalid-csv-content',
      userId: 'user123'
    });
    
    // Verify result
    expect(result).toEqual({
      transactions: [],
      errors,
      totalCount: 2
    });
  });
  
  it('should pass custom header mapping to service', async () => {
    const headerMapping = {
      'Transaction Date': 'date',
      'Merchant': 'name',
      'Amount (CAD)': 'amount_cad',
      'Category Number': 'category_id',
      'Comment': 'notes'
    };
    
    // Setup mock with empty results
    transactionImportService.parseCSV = vi.fn().mockResolvedValue({
      validTransactions: [],
      errors: []
    });
    
    // Execute action with custom mapping
    await action.execute({
      csvContent: 'csv-content-here',
      userId: 'user123',
      headerMapping
    });
    
    // Verify service was called with custom mapping
    expect(transactionImportService.parseCSV).toHaveBeenCalledWith(
      'csv-content-here',
      'user123',
      {
        headerMapping,
        validateCategories: expect.any(Function)
      }
    );
  });
  
  it('should handle empty CSV content gracefully', async () => {
    // Setup mock with empty results
    transactionImportService.parseCSV = vi.fn().mockResolvedValue({
      validTransactions: [],
      errors: []
    });
    
    // Execute action with empty content
    const result = await action.execute({
      csvContent: '',
      userId: 'user123'
    });
    
    // Verify result
    expect(result).toEqual({
      transactions: [],
      errors: [],
      totalCount: 0
    });
    
    // Verify service was still called
    expect(transactionImportService.parseCSV).toHaveBeenCalledWith(
      '',
      'user123',
      expect.objectContaining({
        validateCategories: expect.any(Function)
      })
    );
  });
  
  it('should use validateCategories function that returns empty array for speed optimization', async () => {
    let capturedValidateFunction: ((categoryIds: number[]) => Promise<boolean[]>) | undefined;
    
    // Setup mock to capture the validateCategories function
    transactionImportService.parseCSV = vi.fn().mockImplementation(async (content, userId, options) => {
      capturedValidateFunction = options.validateCategories;
      return {
        validTransactions: [],
        errors: []
      };
    });
    
    // Execute action
    await action.execute({
      csvContent: 'test-content',
      userId: 'user123'
    });
    
    // Verify the validateCategories function was provided
    expect(capturedValidateFunction).toBeDefined();
    
    // Test that the function returns empty array (speed optimization)
    if (capturedValidateFunction) {
      const result = await capturedValidateFunction([1, 2, 3]);
      expect(result).toEqual([]);
    }
  });
  
  it('should propagate errors from TransactionImportService', async () => {
    const error = new Error('CSV parsing failed');
    
    // Setup mock to throw error
    transactionImportService.parseCSV = vi.fn().mockRejectedValue(error);
    
    // Execute action and expect it to throw
    await expect(action.execute({
      csvContent: 'invalid-content',
      userId: 'user123'
    })).rejects.toThrow('CSV parsing failed');
  });
});
