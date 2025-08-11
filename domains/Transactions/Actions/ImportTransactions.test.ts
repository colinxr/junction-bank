import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ImportTransactions } from './ImportTransactions';
import { ITransactionRepository } from '../Repositories/ITransactionRepository';
import { TransactionImportService } from '../Services/TransactionImportService';
import { ICategoryRepository } from '../../Categories/ICategoryRepository';
import { TransactionImportDTO, ImportError } from '../DTOs/TransactionImportDTO';
import { TransactionType } from '../Entities/Transaction';

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
      transactionImportService,
      categoryRepository,
    );
  });
  
  it('should parse CSV and import valid transactions', async () => {
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
    
    // Mock validation errors (none in this test)
    const validationErrors: ImportError[] = [];
    
    // Setup mocks
    transactionImportService.parseCSV = vi.fn().mockResolvedValue({
      validTransactions,
      errors: validationErrors
    });
    
    // Execute action
    const result = await action.execute({
      csvContent: 'csv-content-here',
      clerkId: 'user123'
    });
    
    // Verify service was called
    expect(transactionImportService.parseCSV).toHaveBeenCalledWith(
      'csv-content-here',
      'user123',
      expect.objectContaining({
        validateCategories: expect.any(Function)
      })
    );
    
    // Verify result matches the implementation
    expect(result).toEqual({
      validTransactions,
      errors: validationErrors
    });
  });
  
  it('should handle validation errors and return errors if validation fails', async () => {
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
      clerkId: 'user123'
    });
    
    // Verify service was called
    expect(transactionImportService.parseCSV).toHaveBeenCalled();
    
    // Verify result contains errors
    expect(result).toEqual({
      validTransactions: [],
      errors: validationErrors
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
      clerkId: 'user123',
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