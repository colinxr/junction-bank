import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreTransaction } from './StoreTransaction';
import { TransactionModel } from '../Entities/TransactionModel';
import { TransactionCreateDTO } from '../DTOs/TransactionDTO';
import { ITransactionRepository } from '../Repositories/ITransactionRepository';
import { IMonthRepository } from '@/domains/Months/IMonthRepository';
import { CurrencyService } from '@/domains/Currency/Service/CurrencyService';
import { Month } from '@/domains/Months/Month';
import { TransactionType } from '../Entities/Transaction';

describe('StoreTransaction', () => {
  // Mock repositories and services
  const mockTransactionRepository = {
    index: vi.fn(),
    indexByCategory: vi.fn(),
    indexByMonth: vi.fn(),
    show: vi.fn(),
    store: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    getCategorySpending: vi.fn()
  };
  
  const mockMonthRepository = {
    index: vi.fn(),
    show: vi.fn(),
    findByDate: vi.fn(),
    findByMonthAndYear: vi.fn(),
    store: vi.fn()
  };
  
  const mockCurrencyService = {
    processCurrencyAmounts: vi.fn()
  };
  
  const storeTransaction = new StoreTransaction(
    mockTransactionRepository as unknown as ITransactionRepository,
    mockMonthRepository as unknown as IMonthRepository,
    mockCurrencyService as unknown as CurrencyService
  );
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('stores a transaction with existing month', async () => {
    const testDate = new Date('2023-01-15');
    const monthId = 1;
    
    // Input DTO
    const transactionData: TransactionCreateDTO = {
      clerkId: 'user123',
      name: 'Groceries',
      amountCAD: 50,
      categoryId: 1,
      monthId: monthId,
      type: TransactionType.EXPENSE,
      date: testDate.toISOString()
    };
    
    // Mocked responses
    mockMonthRepository.findByMonthAndYear.mockResolvedValue(true);
    mockMonthRepository.findByDate.mockResolvedValue({ id: monthId });
    mockCurrencyService.processCurrencyAmounts.mockResolvedValue({
      amountCAD: 50,
      amountUSD: undefined
    });
    
    const expectedTransactionData = {
      clerkId: 'user123',
      name: 'Groceries',
      amountCAD: 50,
      amountUSD: null,
      categoryId: 1,
      notes: undefined,
      monthId: monthId,
      type: TransactionType.EXPENSE,
      date: testDate
    };
    
    const savedTransaction = { ...expectedTransactionData, id: 1 } as unknown as TransactionModel;
    mockTransactionRepository.store.mockResolvedValue(savedTransaction);
    
    // Execute the action
    const result = await storeTransaction.execute(transactionData);
    
    // Verify the results
    expect(mockMonthRepository.findByMonthAndYear).toHaveBeenCalledWith(1, 2023);
    expect(mockMonthRepository.findByDate).toHaveBeenCalledWith(1, 2023);
    expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(50, undefined);
    expect(mockTransactionRepository.store).toHaveBeenCalledWith(expectedTransactionData);
    expect(result).toBe(savedTransaction);
  });
  
  it('creates a new month when storing a transaction for a new month', async () => {
    const testDate = new Date('2023-02-15');
    const monthId = 2;
    
    // Input DTO
    const transactionData: TransactionCreateDTO = {
      clerkId: 'user123',
      name: 'Rent',
      amountCAD: 1200,
      categoryId: 2,
      monthId: monthId,
      type: TransactionType.EXPENSE,
      date: testDate.toISOString()
    };
    
    // Mocked responses
    mockMonthRepository.findByMonthAndYear.mockResolvedValue(false);
    const newMonth = new Month({
      id: monthId,
      month: 2,
      year: 2023,
      totalIncome: 0,
      totalExpenses: 0
    });
    mockMonthRepository.store.mockResolvedValue(newMonth);
    mockCurrencyService.processCurrencyAmounts.mockResolvedValue({
      amountCAD: 1200,
      amountUSD: undefined
    });
    
    const expectedTransactionData = {
      clerkId: 'user123',
      name: 'Rent',
      amountCAD: 1200,
      amountUSD: null,
      categoryId: 2,
      notes: undefined,
      monthId: monthId,
      type: TransactionType.EXPENSE,
      date: testDate
    };
    
    const savedTransaction = { ...expectedTransactionData, id: 2 } as unknown as TransactionModel;
    mockTransactionRepository.store.mockResolvedValue(savedTransaction);
    
    // Execute the action
    const result = await storeTransaction.execute(transactionData);
    
    // Verify the results
    expect(mockMonthRepository.findByMonthAndYear).toHaveBeenCalledWith(2, 2023);
    expect(mockMonthRepository.store).toHaveBeenCalled();
    expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(1200, undefined);
    expect(mockTransactionRepository.store).toHaveBeenCalledWith(expectedTransactionData);
    expect(result).toBe(savedTransaction);
  });
  
  it('handles currency conversion for USD amounts', async () => {
    const testDate = new Date('2023-01-15');
    const monthId = 1;
    
    // Input DTO with USD amount
    const transactionData: TransactionCreateDTO = {
      clerkId: 'user123',
      name: 'Online Purchase',
      amountUSD: 75,
      categoryId: 3,
      monthId: monthId,
      type: TransactionType.EXPENSE,
      date: testDate.toISOString()
    };
    
    // Mocked responses
    mockMonthRepository.findByMonthAndYear.mockResolvedValue(true);
    mockMonthRepository.findByDate.mockResolvedValue({ id: monthId });
    mockCurrencyService.processCurrencyAmounts.mockResolvedValue({
      amountCAD: 100, // Assuming conversion rate
      amountUSD: 75
    });
    
    const expectedTransactionData = {
      clerkId: 'user123',
      name: 'Online Purchase',
      amountCAD: 100,
      amountUSD: 75,
      categoryId: 3,
      notes: undefined,
      monthId: monthId,
      type: TransactionType.EXPENSE,
      date: testDate
    };
    
    const savedTransaction = { ...expectedTransactionData, id: 3 } as unknown as TransactionModel;
    mockTransactionRepository.store.mockResolvedValue(savedTransaction);
    
    // Execute the action
    const result = await storeTransaction.execute(transactionData);
    
    // Verify the results
    expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(undefined, 75);
    expect(mockTransactionRepository.store).toHaveBeenCalledWith(expectedTransactionData);
    expect(result).toBe(savedTransaction);
  });
}); 