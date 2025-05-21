import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ImportTransactions } from './ImportTransactions';
import { ITransactionRepository } from '../ITransactionRepository';
import { TransactionImportService } from '../Services/TransactionImportService';
import { ICategoryRepository } from '../../Categories/ICategoryRepository';
import { TransactionImportDTO, TransactionImportResultDTO, ImportError } from '../TransactionImportDTO';
import { TransactionType } from '../Transaction';

describe('ImportTransactions', () => {
  let transactionRepository: ITransactionRepository;
  let transactionImportService: TransactionImportService;
  let categoryRepository: ICategoryRepository;
  let action: ImportTransactions;
  
  beforeEach(() => {
    // Create mocks
    transactionRepository = {
      importTransactions: vi.fn(),
    } as unknown as ITransactionRepository;
    
    transactionImportService = {
      parseCSV: vi.fn(),
    } as unknown as TransactionImportService;
    
    categoryRepository = {
      show: vi.fn(),
    } as unknown as ICategoryRepository;
    
    action = new ImportTransactions(
      transactionRepository,
      transactionImportService,
      categoryRepository
    );
  });
  
  it('should parse CSV and import valid transactions', async () => {
    // Sample valid transactions
    const validTransactions: TransactionImportDTO[] = [
      {
        userId: 'user123',
        name: 'Grocery Shopping',
        amountCAD: 125.50,
        categoryId: 1,
        notes: 'Weekly groceries',
        type: TransactionType.EXPENSE,
        date: new Date('2023-07-15'),
        monthId: 1
      },
      {
        userId: 'user123',
        name: 'Salary',
        amountCAD: 3000,
        categoryId: 2,
        notes: 'Monthly salary',
        type: TransactionType.INCOME,
        date: new Date('2023-07-20'),
        monthId: 1
      }
    ];
    
    // Mock validation errors (none in this test)
    const validationErrors: ImportError[] = [];
    
    // Mock import result
    const importResult: TransactionImportResultDTO = {
      successCount: 2,
      failedCount: 0,
      totalCount: 2,
      errors: [],
      importedTransactions: validTransactions
    };
    
    // Setup mocks
    transactionImportService.parseCSV = vi.fn().mockResolvedValue({
      validTransactions,
      errors: validationErrors
    });
    
    transactionRepository.importTransactions = vi.fn().mockResolvedValue(importResult);
    
    // Execute action
    const result = await action.execute({
      csvContent: 'csv-content-here',
      userId: 'user123'
    });
    
    // Verify service was called
    expect(transactionImportService.parseCSV).toHaveBeenCalledWith(
      'csv-content-here',
      'user123',
      expect.objectContaining({
        validateCategories: expect.any(Function)
      })
    );
    
    // Verify repository was called with valid transactions
    expect(transactionRepository.importTransactions).toHaveBeenCalledWith(validTransactions);
    
    // Verify result
    expect(result).toEqual({
      successCount: 2,
      failedCount: 0,
      totalCount: 2,
      errors: [],
      importedTransactions: validTransactions
    });
  });
  
  it('should handle validation errors and return early if no valid transactions', async () => {
    // Mock validation errors
    const validationErrors: ImportError[] = [
      {
        row: 2,
        message: 'Invalid date format: invalid-date',
        originalData: { date: 'invalid-date', name: 'Grocery', amount_cad: '125.50' }
      }
    ];
    
    // Setup mocks with no valid transactions
    transactionImportService.parseCSV = vi.fn().mockResolvedValue({
      validTransactions: [],
      errors: validationErrors
    });
    
    // Execute action
    const result = await action.execute({
      csvContent: 'csv-content-with-errors',
      userId: 'user123'
    });
    
    // Verify service was called
    expect(transactionImportService.parseCSV).toHaveBeenCalled();
    
    // Verify repository was NOT called (early return)
    expect(transactionRepository.importTransactions).not.toHaveBeenCalled();
    
    // Verify result contains errors
    expect(result).toEqual({
      successCount: 0,
      failedCount: 1,
      totalCount: 1,
      errors: validationErrors
    });
  });
  
  it('should handle mixed valid and invalid transactions', async () => {
    // One valid transaction
    const validTransactions: TransactionImportDTO[] = [
      {
        userId: 'user123',
        name: 'Grocery Shopping',
        amountCAD: 125.50,
        categoryId: 1,
        notes: 'Weekly groceries',
        type: TransactionType.EXPENSE,
        date: new Date('2023-07-15'),
        monthId: 1
      }
    ];
    
    // Mock validation errors
    const validationErrors: ImportError[] = [
      {
        row: 3,
        message: 'Invalid amount format: not-a-number',
        originalData: { date: '2023-07-20', name: 'Salary', amount_cad: 'not-a-number' }
      }
    ];
    
    // Mock import errors
    const importErrors: ImportError[] = [
      {
        row: 1,
        message: 'Database error on transaction insert'
      }
    ];
    
    // Mock import result
    const importResult: TransactionImportResultDTO = {
      successCount: 0,
      failedCount: 1,
      totalCount: 1,
      errors: importErrors
    };
    
    // Setup mocks
    transactionImportService.parseCSV = vi.fn().mockResolvedValue({
      validTransactions,
      errors: validationErrors
    });
    
    transactionRepository.importTransactions = vi.fn().mockResolvedValue(importResult);
    
    // Execute action
    const result = await action.execute({
      csvContent: 'csv-content-mixed',
      userId: 'user123'
    });
    
    // Verify combined errors and counts
    expect(result).toEqual({
      successCount: 0,
      failedCount: 1,
      totalCount: 2, // 1 valid + 1 validation error
      errors: [...importErrors, ...validationErrors]
    });
  });
  
  it('should pass custom header mapping to service', async () => {
    // Setup custom header mapping
    const headerMapping = {
      'Transaction Date': 'date',
      'Merchant': 'name',
      'Amount (CAD)': 'amount',
      'Category Number': 'categoryId',
      'Comment': 'notes'
    };
    
    // Mock empty results
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
    
    // Verify service was called with mapping
    expect(transactionImportService.parseCSV).toHaveBeenCalledWith(
      'csv-content-here',
      'user123',
      expect.objectContaining({
        headerMapping,
        validateCategories: expect.any(Function)
      })
    );
  });
}); 