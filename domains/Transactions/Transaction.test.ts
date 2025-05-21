import { describe, it, expect } from 'vitest';
import { Transaction, TransactionType } from './Transaction';

describe('Transaction', () => {
  const testDate = new Date('2023-01-01');
  const testMonth = 202301;
  
  it('creates a valid transaction with required fields', () => {
    const transaction = Transaction.create({
      clerkId: 'user123',
      name: 'Groceries',
      amountCAD: 50,
      categoryId: 1,
      date: testDate,
      monthId: testMonth
    });
    
    expect(transaction.clerkId).toBe('user123');
    expect(transaction.name).toBe('Groceries');
    expect(transaction.amountCAD).toBe(50);
    expect(transaction.categoryId).toBe(1);
    expect(transaction.type).toBe(TransactionType.EXPENSE); // Default is expense
    expect(transaction.date).toBe(testDate);
    expect(transaction.monthId).toBe(testMonth);
    expect(transaction.notes).toBeUndefined();
    expect(transaction.amountUSD).toBeUndefined();
  });
  
  it('creates a valid income transaction', () => {
    const transaction = Transaction.create({
      clerkId: 'user123',
      name: 'Salary',
      amountCAD: 2000,
      categoryId: 5,
      type: TransactionType.INCOME,
      notes: 'Monthly income',
      date: testDate,
      monthId: testMonth
    });
    
    expect(transaction.name).toBe('Salary');
    expect(transaction.type).toBe(TransactionType.INCOME);
    expect(transaction.notes).toBe('Monthly income');
  });
  
  it('creates a transaction with USD amount', () => {
    const transaction = Transaction.create({
      clerkId: 'user123',
      name: 'Online Purchase',
      amountCAD: 50,
      amountUSD: 38,
      categoryId: 2,
      date: testDate,
      monthId: testMonth
    });
    
    expect(transaction.amountCAD).toBe(50);
    expect(transaction.amountUSD).toBe(38);
  });
  
  it('preserves id and createdAt when provided', () => {
    const createdAt = new Date('2023-01-02');
    
    const transaction = Transaction.create({
      id: 123,
      clerkId: 'user123',
      name: 'Rent',
      amountCAD: 1200,
      categoryId: 3,
      date: testDate,
      monthId: testMonth,
      createdAt: createdAt
    });
    
    expect(transaction.id).toBe(123);
    expect(transaction.createdAt).toBe(createdAt);
  });
}); 