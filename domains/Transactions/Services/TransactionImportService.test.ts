import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TransactionImportService } from './TransactionImportService';
import { IMonthRepository } from '../../Months/IMonthRepository';
import { Month } from '../../Months/Month';
import { TransactionType } from '../Transaction';

describe('TransactionImportService', () => {
  let monthRepository: IMonthRepository;
  let service: TransactionImportService;
  
  beforeEach(() => {
    // Create mock for month repository
    monthRepository = {
      index: vi.fn(),
      show: vi.fn(),
      findByDate: vi.fn(),
      findLatest: vi.fn(),
      store: vi.fn(),
      update: vi.fn(),
      destroy: vi.fn(),
      findByMonthAndYear: vi.fn(),
      hasTransactions: vi.fn()
    };
    
    service = new TransactionImportService(monthRepository);
  });
  
  describe('parseCSV', () => {
    it('should parse valid CSV content', async () => {
      // Mock month repository to return null (month doesn't exist)
      monthRepository.findByDate = vi.fn().mockResolvedValue(null);
      
      // Mock month repository store to return a month with ID
      monthRepository.store = vi.fn().mockResolvedValue(Month.create({
        id: 1,
        month: 7,
        year: 2023
      }));
      
      const csvContent = `Date,Description,Amount,Category ID,Notes,Type
2023-07-15,Grocery Shopping,125.50,1,Weekly groceries,Expense
2023-07-20,Salary,3000,2,Monthly salary,Income`;
      
      const result = await service.parseCSV(csvContent, 'user123');
      
      expect(result.validTransactions.length).toBe(2);
      expect(result.errors.length).toBe(0);
      
      // Check first transaction (expense)
      expect(result.validTransactions[0]).toEqual(expect.objectContaining({
        userId: 'user123',
        name: 'Grocery Shopping',
        amountCAD: 125.50,
        categoryId: 1,
        notes: 'Weekly groceries',
        type: TransactionType.EXPENSE,
        monthId: 1
      }));
      
      // Check second transaction (income)
      expect(result.validTransactions[1]).toEqual(expect.objectContaining({
        userId: 'user123',
        name: 'Salary',
        amountCAD: 3000,
        categoryId: 2,
        notes: 'Monthly salary',
        type: TransactionType.INCOME,
        monthId: 1
      }));
      
      // Verify month repository calls
      expect(monthRepository.findByDate).toHaveBeenCalledTimes(2);
      expect(monthRepository.store).toHaveBeenCalledTimes(1);
    });
    
    it('should detect and report errors in CSV data', async () => {
      const csvContent = `Date,Description,Amount,Category ID,Notes,Type
invalid-date,Grocery Shopping,125.50,1,Weekly groceries,Expense
2023-07-20,Salary,not-a-number,2,Monthly salary,Income
2023-07-25,Missing Category,,,,Expense`;
      
      const result = await service.parseCSV(csvContent, 'user123');
      
      expect(result.validTransactions.length).toBe(0);
      expect(result.errors.length).toBe(3);
      
      // Error for invalid date
      expect(result.errors[0].message).toContain('Invalid date format');
      
      // Error for invalid amount
      expect(result.errors[1].message).toContain('Invalid amount format');
      
      // Error for missing required fields
      expect(result.errors[2].message).toContain('Missing');
    });
    
    it('should use existing month if it exists', async () => {
      // Mock month repository to return existing month
      const existingMonth = Month.create({
        id: 5,
        month: 7,
        year: 2023
      });
      
      monthRepository.findByDate = vi.fn().mockResolvedValue(existingMonth);
      
      const csvContent = `Date,Description,Amount,Category ID,Notes,Type
2023-07-15,Grocery Shopping,125.50,1,Weekly groceries,Expense`;
      
      const result = await service.parseCSV(csvContent, 'user123');
      
      expect(result.validTransactions.length).toBe(1);
      expect(result.validTransactions[0].monthId).toBe(5);
      
      // Verify month repository was called but store was not
      expect(monthRepository.findByDate).toHaveBeenCalledTimes(1);
      expect(monthRepository.store).not.toHaveBeenCalled();
    });
    
    it('should handle custom header mapping', async () => {
      // Mock month repository
      monthRepository.findByDate = vi.fn().mockResolvedValue(null);
      monthRepository.store = vi.fn().mockResolvedValue(Month.create({
        id: 1,
        month: 7,
        year: 2023
      }));
      
      const csvContent = `Transaction Date,Merchant,Amount (CAD),Category Number,Comment
2023-07-15,Grocery Shopping,125.50,1,Weekly groceries`;
      
      const headerMapping = {
        'Transaction Date': 'date',
        'Merchant': 'name',
        'Amount (CAD)': 'amount',
        'Category Number': 'categoryId',
        'Comment': 'notes'
      };
      
      const result = await service.parseCSV(csvContent, 'user123', { headerMapping });
      
      expect(result.validTransactions.length).toBe(1);
      expect(result.errors.length).toBe(0);
      
      expect(result.validTransactions[0]).toEqual(expect.objectContaining({
        name: 'Grocery Shopping',
        amountCAD: 125.50,
        categoryId: 1,
        notes: 'Weekly groceries'
      }));
    });
    
    it('should validate categories if validateCategories function provided', async () => {
      // Mock month repository
      monthRepository.findByDate = vi.fn().mockResolvedValue(null);
      monthRepository.store = vi.fn().mockResolvedValue(Month.create({
        id: 1,
        month: 7,
        year: 2023
      }));
      
      // Mock category validation function
      const validateCategories = vi.fn()
        .mockResolvedValueOnce([true])   // First category exists
        .mockResolvedValueOnce([false]); // Second category doesn't exist
      
      const csvContent = `Date,Description,Amount,Category ID,Notes,Type
2023-07-15,Grocery Shopping,125.50,1,Weekly groceries,Expense
2023-07-20,Salary,3000,99,Monthly salary,Income`;
      
      const result = await service.parseCSV(csvContent, 'user123', { validateCategories });
      
      expect(result.validTransactions.length).toBe(1);
      expect(result.errors.length).toBe(1);
      
      // Should include error about invalid category
      expect(result.errors[0].message).toContain('Category with ID 99 does not exist');
      
      // Valid transaction should be processed
      expect(result.validTransactions[0].categoryId).toBe(1);
      
      // Validate categories should be called for both transactions
      expect(validateCategories).toHaveBeenCalledTimes(2);
    });
  });
}); 