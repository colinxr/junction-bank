import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreRecurringTransaction } from './StoreRecurringTransaction';
import { RecurringTransaction, TransactionType } from '../RecurringTransaction';
import type { IRecurringTransactionRepository } from '../IRecurringTransactionRepository';
import { CurrencyService } from '@/domains/Currency/Service/CurrencyService';

describe('StoreRecurringTransaction', () => {
  // Create mock repository
  const mockRepository = {
    index: vi.fn(),
    show: vi.fn(),
    store: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    findByName: vi.fn(),
    applyToMonth: vi.fn()
  };
  
  // Create mock currency service
  const mockCurrencyService = {
    processCurrencyAmounts: vi.fn()
  };
  
  const storeRecurringTransaction = new StoreRecurringTransaction(
    mockRepository as unknown as IRecurringTransactionRepository,
    mockCurrencyService as unknown as CurrencyService
  );
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('stores a new recurring transaction successfully', async () => {
    const currencyResult = { amountCAD: 1500, amountUSD: 1100 };
    mockCurrencyService.processCurrencyAmounts.mockResolvedValue(currencyResult);
    
    const expectedTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      amountUSD: 1100,
      categoryId: 2,
      notes: 'Test notes',
      dayOfMonth: 1,
      type: TransactionType.EXPENSE
    });
    
    mockRepository.store.mockResolvedValue(expectedTransaction);
    
    const result = await storeRecurringTransaction.execute({
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      notes: 'Test notes',
      dayOfMonth: 1,
      type: TransactionType.EXPENSE
    });
    
    expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(1500, undefined);
    expect(mockRepository.store).toHaveBeenCalled();
    expect(result).toBe(expectedTransaction);
  });
  
  it('handles USD amounts correctly', async () => {
    const currencyResult = { amountCAD: 1300, amountUSD: 1000 };
    mockCurrencyService.processCurrencyAmounts.mockResolvedValue(currencyResult);
    
    const expectedTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1300,
      amountUSD: 1000,
      categoryId: 2,
      type: TransactionType.EXPENSE
    });
    
    mockRepository.store.mockResolvedValue(expectedTransaction);
    
    await storeRecurringTransaction.execute({
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountUSD: 1000,
      categoryId: 2,
      type: TransactionType.EXPENSE
    });
    
    expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(undefined, 1000);
    expect(mockRepository.store).toHaveBeenCalled();
  });

  it('throws error for invalid transaction type', async () => {
    await expect(storeRecurringTransaction.execute({
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      type: 'invalid_type'
    })).rejects.toThrow('Invalid transaction type: invalid_type. Must be \'Income\' or \'Expense\'');
  });

  it('handles valid string transaction type', async () => {
    const currencyResult = { amountCAD: 1500, amountUSD: undefined };
    mockCurrencyService.processCurrencyAmounts.mockResolvedValue(currencyResult);
    
    const expectedTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      type: TransactionType.INCOME
    });
    
    mockRepository.store.mockResolvedValue(expectedTransaction);
    
    const result = await storeRecurringTransaction.execute({
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      type: 'Income'
    });
    
    expect(result).toBe(expectedTransaction);
  });
}); 