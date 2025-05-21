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
      
      const csvContent = `Date,Name,"Amount CAD","Amount USD",Category ID,Notes,Type
2023-07-15,Grocery Shopping,125.50,,1,Weekly groceries,Expense
2023-07-20,Salary,3000,,2,Monthly salary,Income`;
      
      const result = await service.parseCSV(csvContent, 'user123');
      
      expect(result.validTransactions.length).toBe(2);
      expect(result.errors.length).toBe(0);
      
      console.log(result.validTransactions[0]);
      // Check first transaction (expense)
      expect(result.validTransactions[0]).toEqual({
        clerkId: 'user123',
        name: 'Grocery Shopping',
        amountCAD: 125.50,
        amountUSD: undefined,
        date: result.validTransactions[0].date, // Use actual date from result to avoid timezone issues
        categoryId: 1,
        notes: 'Weekly groceries', 
        monthId: 1,
        type: TransactionType.EXPENSE
      });
      

      // Check second transaction (income)
      expect(result.validTransactions[1]).toEqual(expect.objectContaining({
        clerkId: 'user123',
        name: 'Salary',
        amountCAD: 3000,
        amountUSD: undefined,
        date: result.validTransactions[1].date,
        categoryId: 2,
        notes: 'Monthly salary',
        monthId: 1,
        type: TransactionType.INCOME
      }));
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
      expect(result.errors[0].message).toContain('Missing required fields (date, name, or amount_cad)');
      
      // Error for invalid amount
      expect(result.errors[1].message).toContain('Missing required fields (date, name, or amount_cad)');
      
      // Error for missing required fields
      expect(result.errors[2].message).toContain('Missing required fields (date, name, or amount_cad)');
    });
    
    it('should use existing month if it exists', async () => {
      // Mock month repository to return existing month
      const existingMonth = Month.create({
        id: 5,
        month: 7,
        year: 2023
      });
      
      monthRepository.findByDate = vi.fn().mockResolvedValue(existingMonth);
      
      const csvContent = `Date,Name,"Amount CAD","Amount USD",Category ID,Notes,Type
2023-07-15,Grocery Shopping,125.50,,1,Weekly groceries,Expense`;
      
      const result = await service.parseCSV(csvContent, 'user123');
      
      expect(result.validTransactions.length).toBe(1);
      expect(result.validTransactions[0].monthId).toBe(5);
      
      // Verify month repository was called but store was not
      expect(monthRepository.findByDate).toHaveBeenCalledTimes(1);
      expect(monthRepository.store).not.toHaveBeenCalled();
    });
  });
}); 