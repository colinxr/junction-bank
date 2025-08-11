import { describe, it, expect } from 'vitest';
import { toCoreTransaction } from './transactions';
import { TransactionCreateDTO } from '@/domains/Transactions/TransactionDTO';

describe('Transaction API Adapters', () => {
  describe('toCoreTransaction', () => {
    it('parses ISO date strings', () => {
      const createDto: TransactionCreateDTO = {
        clerkId: 'user_123',
        name: 'Test Transaction',
        amountCAD: 100,
        categoryId: 1,
        notes: 'Test notes',
        type: 'Expense',
        date: '2025-01-01T00:00:00.000Z',
        monthId: 1
      };

      const result = toCoreTransaction(createDto);
      
      expect(result.date).toBeInstanceOf(Date);
      expect(result.date.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    });

    it('handles invalid date strings', () => {
      const createDto: TransactionCreateDTO = {
        clerkId: 'user_123',
        name: 'Test Transaction',
        amountCAD: 100,
        categoryId: 1,
        notes: 'Test notes',
        type: 'Expense',
        date: 'invalid-date',
        monthId: 1
      };

      expect(() => toCoreTransaction(createDto)).toThrow('Invalid date format');
    });

    it('preserves all other fields', () => {
      const createDto: TransactionCreateDTO = {
        clerkId: 'user_123',
        name: 'Test Transaction',
        amountCAD: 100,
        amountUSD: 75,
        categoryId: 1,
        notes: 'Test notes',
        type: 'Expense',
        date: '2025-01-01T00:00:00.000Z',
        monthId: 1
      };

      const result = toCoreTransaction(createDto);
      
      expect(result.clerkId).toBe('user_123');
      expect(result.name).toBe('Test Transaction');
      expect(result.amountCAD).toBe(100);
      expect(result.amountUSD).toBe(75);
      expect(result.categoryId).toBe(1);
      expect(result.notes).toBe('Test notes');
      expect(result.type).toBe('Expense');
      expect(result.monthId).toBe(1);
    });

    it('handles null notes', () => {
      const createDto: TransactionCreateDTO = {
        clerkId: 'user_123',
        name: 'Test Transaction',
        amountCAD: 100,
        categoryId: 1,
        notes: null,
        type: 'Expense',
        date: '2025-01-01T00:00:00.000Z',
        monthId: 1
      };

      const result = toCoreTransaction(createDto);
      expect(result.notes).toBeNull();
    });

    it('handles missing optional fields', () => {
      const createDto: TransactionCreateDTO = {
        clerkId: 'user_123',
        name: 'Test Transaction',
        amountCAD: 100,
        categoryId: 1,
        type: 'Expense',
        date: '2025-01-01T00:00:00.000Z',
        monthId: 1
      };

      const result = toCoreTransaction(createDto);
      expect(result.amountUSD).toBeUndefined();
      expect(result.notes).toBeUndefined();
    });
  });
});
