import { describe, it, expect } from 'vitest';
import { toTransactionDTO, TransactionDTO } from './TransactionDTO';
import { Transaction } from './Transaction';
import { mockTransaction } from './Factories/TransactionFactories';

describe('TransactionDTO', () => {
  it('returns undefined for notes if null in DB', () => {
    const dbTx = mockTransaction({
      notes: null
    });

    const result = toTransactionDTO(dbTx);
    expect(result.notes).toBeUndefined();
  });

  it('preserves notes if present in DB', () => {
    const dbTx = mockTransaction({
      notes: 'Some notes'
    });

    const result = toTransactionDTO(dbTx);
    expect(result.notes).toBe('Some notes');
  });

  it('converts Date to ISO string', () => {
    const dbTx = mockTransaction({
      date: new Date('2025-01-01T00:00:00.000Z')
    });

    const result = toTransactionDTO(dbTx);
    expect(result.date).toBe('2025-01-01T00:00:00.000Z');
  });

  it('includes category name if provided', () => {
    const dbTx = mockTransaction({
      category: { 
        id: 1, 
        name: 'Food', 
        type: 'expense',
        notes: null,
        createdAt: new Date(),
        isRecurring: false,
        transactions: [],
        recurringTransactions: []
      }
    });

    const result = toTransactionDTO(dbTx);
    expect(result.categoryName).toBe('Food');
  });
});
