import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateRecurringTransaction } from './UpdateRecurringTransaction';
import { RecurringTransaction, TransactionType } from '../RecurringTransaction';
import { RecurringTransactionNotFoundException, RecurringTransactionAlreadyExistsException } from '../RecurringTransactionException';
import type { IRecurringTransactionRepository } from '../IRecurringTransactionRepository';
import { CurrencyService } from '@/domains/Currency/Service/CurrencyService';

describe('UpdateRecurringTransaction', () => {
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
  
  const updateRecurringTransaction = new UpdateRecurringTransaction(
    mockRepository as unknown as IRecurringTransactionRepository,
    mockCurrencyService as unknown as CurrencyService
  );
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('updates a recurring transaction when it exists and no conflicts', async () => {
    const existingTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      notes: 'Old notes',
      type: TransactionType.EXPENSE
    });
    
    const updatedTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      notes: 'Updated notes',
      type: TransactionType.EXPENSE
    });
    
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockRepository.update.mockResolvedValue(updatedTransaction);
    
    const result = await updateRecurringTransaction.execute(1, { notes: 'Updated notes' });
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.findByName).not.toHaveBeenCalled();
    expect(mockRepository.update).toHaveBeenCalledWith(1, { notes: 'Updated notes' });
    expect(result).toBe(updatedTransaction);
  });
  
  it('throws RecurringTransactionNotFoundException when transaction does not exist', async () => {
    mockRepository.show.mockResolvedValue(null);
    
    await expect(updateRecurringTransaction.execute(999, { notes: 'Updated notes' }))
      .rejects.toThrow(RecurringTransactionNotFoundException);
    
    expect(mockRepository.show).toHaveBeenCalledWith(999);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });
  
  it('checks for conflicts when changing name and none exist', async () => {
    const existingTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      type: TransactionType.EXPENSE
    });
    
    const updatedTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Housing Rent',
      amountCAD: 1500,
      categoryId: 2,
      type: TransactionType.EXPENSE
    });
    
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockRepository.findByName.mockResolvedValue(false);
    mockRepository.update.mockResolvedValue(updatedTransaction);
    
    const result = await updateRecurringTransaction.execute(1, { name: 'Housing Rent' });
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.findByName).toHaveBeenCalledWith('Housing Rent');
    expect(mockRepository.update).toHaveBeenCalledWith(1, { name: 'Housing Rent' });
    expect(result).toBe(updatedTransaction);
  });
  
  it('throws RecurringTransactionAlreadyExistsException when changing name to an existing one', async () => {
    const existingTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      type: TransactionType.EXPENSE
    });
    
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockRepository.findByName.mockResolvedValue(true);
    
    await expect(updateRecurringTransaction.execute(1, { name: 'Existing Name' }))
      .rejects.toThrow(RecurringTransactionAlreadyExistsException);
    
    expect(mockRepository.show).toHaveBeenCalledWith(1);
    expect(mockRepository.findByName).toHaveBeenCalledWith('Existing Name');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });
  
  it('handles null values by converting to undefined', async () => {
    const existingTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      notes: 'Some notes',
      dayOfMonth: 1,
      type: TransactionType.EXPENSE
    });
    
    const updatedTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      notes: undefined,
      dayOfMonth: undefined,
      type: TransactionType.EXPENSE
    });
    
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockRepository.update.mockResolvedValue(updatedTransaction);
    
    const result = await updateRecurringTransaction.execute(1, { 
      notes: null,
      dayOfMonth: null
    });
    
    expect(mockRepository.update).toHaveBeenCalledWith(1, { 
      notes: undefined,
      dayOfMonth: undefined
    });
    expect(result).toBe(updatedTransaction);
  });
  
  it('processes currency amounts when updating', async () => {
    const existingTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      type: TransactionType.EXPENSE
    });
    
    const updatedTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1300,
      amountUSD: 1000,
      categoryId: 2,
      type: TransactionType.EXPENSE
    });
    
    const currencyResult = { amountCAD: 1300, amountUSD: 1000 };
    
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockCurrencyService.processCurrencyAmounts.mockResolvedValue(currencyResult);
    mockRepository.update.mockResolvedValue(updatedTransaction);
    
    const result = await updateRecurringTransaction.execute(1, { 
      amountCAD: 1300,
      amountUSD: 1000
    });
    
    expect(mockCurrencyService.processCurrencyAmounts).toHaveBeenCalledWith(1300, 1000);
    expect(mockRepository.update).toHaveBeenCalledWith(1, { 
      amountCAD: 1300,
      amountUSD: 1000
    });
    expect(result).toBe(updatedTransaction);
  });
  
  it('handles removing USD amount', async () => {
    const existingTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      amountUSD: 1200,
      categoryId: 2,
      type: TransactionType.EXPENSE
    });
    
    const updatedTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1600,
      amountUSD: undefined,
      categoryId: 2,
      type: TransactionType.EXPENSE
    });
    
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockRepository.update.mockResolvedValue(updatedTransaction);
    
    const result = await updateRecurringTransaction.execute(1, { 
      amountCAD: 1600,
      amountUSD: null
    });
    
    expect(mockCurrencyService.processCurrencyAmounts).not.toHaveBeenCalled();
    expect(mockRepository.update).toHaveBeenCalledWith(1, { 
      amountCAD: 1600,
      amountUSD: undefined
    });
    expect(result).toBe(updatedTransaction);
  });

  it('throws error for invalid transaction type', async () => {
    const existingTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      type: TransactionType.EXPENSE
    });
    
    mockRepository.show.mockResolvedValue(existingTransaction);
    
    await expect(updateRecurringTransaction.execute(1, { 
      type: 'invalid_type'
    })).rejects.toThrow('Invalid transaction type: invalid_type. Must be \'Income\' or \'Expense\'');
  });

  it('handles valid string transaction type', async () => {
    const existingTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      type: TransactionType.EXPENSE
    });
    
    const updatedTransaction = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      categoryId: 2,
      type: TransactionType.INCOME
    });
    
    mockRepository.show.mockResolvedValue(existingTransaction);
    mockRepository.update.mockResolvedValue(updatedTransaction);
    
    const result = await updateRecurringTransaction.execute(1, { 
      type: 'Income'
    });
    
    expect(mockRepository.update).toHaveBeenCalledWith(1, { 
      type: TransactionType.INCOME
    });
    expect(result).toBe(updatedTransaction);
  });
}); 