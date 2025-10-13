import { describe, it, expect } from 'vitest';
import { RecurringTransaction, TransactionType } from './RecurringTransaction';

describe('RecurringTransaction', () => {
  const validProps = {
    id: 1,
    clerkId: 'user123',
    name: 'Monthly Rent',
    amountCAD: 1500,
    categoryId: 2,
    dayOfMonth: 1,
    type: TransactionType.EXPENSE,
    notes: 'Apartment rent',
    createdAt: new Date('2023-05-01')
  };

  it('creates a valid recurring transaction', () => {
    const transaction = new RecurringTransaction(validProps);
    
    expect(transaction.id).toBe(1);
    expect(transaction.clerkId).toBe('user123');
    expect(transaction.name).toBe('Monthly Rent');
    expect(transaction.amountCAD).toBe(1500);
    expect(transaction.categoryId).toBe(2);
    expect(transaction.dayOfMonth).toBe(1);
    expect(transaction.type).toBe(TransactionType.EXPENSE);
    expect(transaction.notes).toBe('Apartment rent');
    expect(transaction.createdAt).toEqual(new Date('2023-05-01'));
  });

  it('creates a valid recurring transaction with minimal properties', () => {
    const transaction = new RecurringTransaction({
      name: 'Internet Bill',
      amountCAD: 100,
      categoryId: 3,
    });
    
    expect(transaction.name).toBe('Internet Bill');
    expect(transaction.amountCAD).toBe(100);
    expect(transaction.categoryId).toBe(3);
    expect(transaction.type).toBe(TransactionType.EXPENSE); // Default value
  });

  it('throws error for invalid amount', () => {
    expect(() => new RecurringTransaction({
      ...validProps,
      amountCAD: 0
    })).toThrow('Transaction amount must be greater than 0');
    
    expect(() => new RecurringTransaction({
      ...validProps,
      amountCAD: -100
    })).toThrow('Transaction amount must be greater than 0');
  });

  it('throws error for invalid day of month', () => {
    expect(() => new RecurringTransaction({
      ...validProps,
      dayOfMonth: 0
    })).toThrow('Day of month must be between 1 and 31');
    
    expect(() => new RecurringTransaction({
      ...validProps,
      dayOfMonth: 32
    })).toThrow('Day of month must be between 1 and 31');
  });

  it('correctly identifies income type', () => {
    const income = new RecurringTransaction({
      ...validProps,
      type: TransactionType.INCOME
    });
    
    expect(income.isIncome()).toBe(true);
    expect(income.isExpense()).toBe(false);
  });

  it('correctly identifies expense type', () => {
    const expense = new RecurringTransaction({
      ...validProps,
      type: TransactionType.EXPENSE
    });
    
    expect(expense.isExpense()).toBe(true);
    expect(expense.isIncome()).toBe(false);
  });

  it('creates a transaction using the static create method', () => {
    const transaction = RecurringTransaction.create({
      clerkId: 'user123',
      name: 'Gym Membership',
      amountCAD: 50,
      categoryId: 4,
      type: TransactionType.EXPENSE
    });
    
    expect(transaction).toBeInstanceOf(RecurringTransaction);
    expect(transaction.name).toBe('Gym Membership');
    expect(transaction.clerkId).toBe('user123');
    expect(transaction.amountCAD).toBe(50);
    expect(transaction.type).toBe(TransactionType.EXPENSE);
  });

  describe('validateType', () => {
    it('validates Income type from string', () => {
      expect(RecurringTransaction.validateType('Income')).toBe(TransactionType.INCOME);
    });

    it('validates Expense type from string', () => {
      expect(RecurringTransaction.validateType('Expense')).toBe(TransactionType.EXPENSE);
    });

    it('validates Income type from enum', () => {
      expect(RecurringTransaction.validateType(TransactionType.INCOME)).toBe(TransactionType.INCOME);
    });

    it('validates Expense type from enum', () => {
      expect(RecurringTransaction.validateType(TransactionType.EXPENSE)).toBe(TransactionType.EXPENSE);
    });

    it('throws error for invalid type', () => {
      expect(() => RecurringTransaction.validateType('invalid')).toThrow('Invalid transaction type: invalid. Must be \'Income\' or \'Expense\'');
    });

    it('throws error for empty string', () => {
      expect(() => RecurringTransaction.validateType('')).toThrow('Invalid transaction type: . Must be \'Income\' or \'Expense\'');
    });
  });
}); 