import { describe, it, expect } from 'vitest';
import { TransactionMapper } from './TransactionMapper';
import { Transaction, TransactionType } from '../Entities/Transaction';

describe('TransactionMapper', () => {
  it('maps Prisma transaction to domain entity', () => {
    const prismaTransaction = {
      id: 1,
      clerkId: 'user_123',
      name: 'Test Transaction',
      amountCAD: 100,
      amountUSD: null,
      categoryId: 1,
      category: { name: 'Food' },
      notes: 'Test notes',
      type: 'Expense',
      date: new Date('2025-01-01'),
      monthId: 1,
      createdAt: new Date('2025-01-01'),
    } as any;

    const result = TransactionMapper.toDomain(prismaTransaction);

    expect(result).toBeInstanceOf(Transaction);
    expect(result.id).toBe(1);
    expect(result.name).toBe('Test Transaction');
    expect(result.amountCAD).toBe(100);
    expect(result.amountUSD).toBeNull();
    expect(result.categoryName).toBe('Food');
    expect(result.notes).toBe('Test notes');
    expect(result.type).toBe(TransactionType.EXPENSE);
  });

  it('maps domain entity to DTO', () => {
    const transaction = Transaction.create({
      id: 1,
      clerkId: 'user_123',
      name: 'Test Transaction',
      amountCAD: 100,
      amountUSD: null,
      categoryId: 1,
      categoryName: 'Food',
      notes: 'Test notes',
      type: TransactionType.EXPENSE,
      date: new Date('2025-01-01'),
      monthId: 1,
      createdAt: new Date('2025-01-01'),
    });

    const result = TransactionMapper.toDTO(transaction);

    expect(result.id).toBe(1);
    expect(result.name).toBe('Test Transaction');
    expect(result.amountCAD).toBe(100);
    expect(result.amountUSD).toBeNull();
    expect(result.categoryName).toBe('Food');
    expect(result.notes).toBe('Test notes');
    expect(result.type).toBe(TransactionType.EXPENSE);
    expect(result.date).toBe('2025-01-01T00:00:00.000Z');
  });

  it('maps raw Prisma result directly to DTO', () => {
    const rawTransaction = {
      id: 1,
      clerkId: 'user_123',
      name: 'Test Transaction',
      amountCAD: 100,
      amountUSD: null,
      categoryId: 1,
      category: { name: 'Food' },
      notes: 'Test notes',
      type: 'Expense',
      date: new Date('2025-01-01'),
      monthId: 1,
      createdAt: new Date('2025-01-01'),
    } as any;

    const result = TransactionMapper.toDTOFromRaw(rawTransaction);

    expect(result.id).toBe(1);
    expect(result.name).toBe('Test Transaction');
    expect(result.amountCAD).toBe(100);
    expect(result.amountUSD).toBeNull();
    expect(result.categoryName).toBe('Food');
    expect(result.notes).toBe('Test notes');
    expect(result.type).toBe('Expense');
    expect(result.date).toBe('2025-01-01T00:00:00.000Z');
  });

  it('maps array of transactions to DTOs', () => {
    const rawTransactions = [
      {
        id: 1,
        name: 'Transaction 1',
        amountCAD: 100,
        categoryId: 1,
        type: 'Expense',
        date: new Date('2025-01-01'),
      },
      {
        id: 2,
        name: 'Transaction 2',
        amountCAD: 200,
        categoryId: 2,
        type: 'Income',
        date: new Date('2025-01-02'),
      },
    ] as any[];

    const result = TransactionMapper.toDTOs(rawTransactions);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe('Transaction 1');
    expect(result[1].id).toBe(2);
    expect(result[1].name).toBe('Transaction 2');
  });

  it('maps category spending data to DTO', () => {
    const transaction = Transaction.create({
      id: 1,
      clerkId: 'user_123',
      name: 'Test Transaction',
      amountCAD: 100,
      categoryId: 1,
      categoryName: 'Food',
      type: TransactionType.EXPENSE,
      date: new Date('2025-01-01'),
      monthId: 1,
    });

    const result = TransactionMapper.toCategorySpendingDTO(transaction, 500, 5);

    expect(result.categoryId).toBe(1);
    expect(result.categoryName).toBe('Food');
    expect(result.totalSpent).toBe(500);
    expect(result.transactionCount).toBe(5);
  });
}); 