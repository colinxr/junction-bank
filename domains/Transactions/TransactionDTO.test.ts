import { describe, it, expect } from 'vitest';
import { toTransactionDTO, TransactionDTO } from './TransactionDTO';
import { Transaction } from './Transaction';

describe('TransactionDTO', () => {
  it('returns undefined for notes if null in DB', () => {
    const dbTx = {
      id: 1,
      clerkId: 'user_123',
      name: 'Test Transaction',
      amountCAD: 100,
      amountUSD: null,
      categoryId: 1,
      notes: null,
      date: new Date('2025-01-01'),
      type: 'Expense' as const,
      monthId: 1,
      createdAt: new Date(),
      category: { id: 1, name: 'Food', type: 'expense' },
      month: { id: 1, month: 1, year: 2025 }
    } as Transaction;

    const result = toTransactionDTO(dbTx);
    expect(result.notes).toBeUndefined();
  });

  it('preserves notes if present in DB', () => {
    const dbTx = {
      id: 1,
      clerkId: 'user_123',
      name: 'Test Transaction',
      amountCAD: 100,
      amountUSD: null,
      categoryId: 1,
      notes: 'Some notes',
      date: new Date('2025-01-01'),
      type: 'Expense' as const,
      monthId: 1,
      createdAt: new Date(),
      category: { id: 1, name: 'Food', type: 'expense' },
      month: { id: 1, month: 1, year: 2025 }
    } as Transaction;

    const result = toTransactionDTO(dbTx);
    expect(result.notes).toBe('Some notes');
  });

  it('converts Date to ISO string', () => {
    const dbTx = {
      id: 1,
      clerkId: 'user_123',
      name: 'Test Transaction',
      amountCAD: 100,
      amountUSD: null,
      categoryId: 1,
      notes: null,
      date: new Date('2025-01-01T00:00:00.000Z'),
      type: 'Expense' as const,
      monthId: 1,
      createdAt: new Date(),
      category: { id: 1, name: 'Food', type: 'expense' },
      month: { id: 1, month: 1, year: 2025 }
    } as Transaction;

    const result = toTransactionDTO(dbTx);
    expect(result.date).toBe('2025-01-01T00:00:00.000Z');
  });

  it('includes category name if provided', () => {
    const dbTx = {
      id: 1,
      clerkId: 'user_123',
      name: 'Test Transaction',
      amountCAD: 100,
      amountUSD: null,
      categoryId: 1,
      notes: null,
      date: new Date('2025-01-01'),
      type: 'Expense' as const,
      monthId: 1,
      createdAt: new Date(),
      category: { id: 1, name: 'Food', type: 'expense' },
      month: { id: 1, month: 1, year: 2025 }
    } as Transaction;

    const result = toTransactionDTO(dbTx);
    expect(result.categoryName).toBe('Food');
  });
});
