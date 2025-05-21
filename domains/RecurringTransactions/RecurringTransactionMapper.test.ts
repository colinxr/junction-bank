import { describe, it, expect, vi } from 'vitest';
import { RecurringTransactionMapper } from './RecurringTransactionMapper';
import { RecurringTransaction, TransactionType } from './RecurringTransaction';
import { Prisma } from '@prisma/client';

// Mock the Prisma.RecurringTransaction type for testing
type MockPrismaRecurringTransaction = {
  id: number;
  clerkId: string;
  name: string;
  amountCAD: Prisma.Decimal;
  amountUSD: Prisma.Decimal | null;
  categoryId: number;
  notes: string | null;
  dayOfMonth: number | null;
  type: TransactionType;
  createdAt: Date;
};

describe('RecurringTransactionMapper', () => {
  // Create mock Prisma Decimal values
  const createDecimal = (value: number) => {
    return {
      d: [value],
      toNumber: () => value,
      toString: () => value.toString()
    } as unknown as Prisma.Decimal;
  };
  
  const testDate = new Date('2023-01-01');
  
  const prismaRecurringTransactionData: MockPrismaRecurringTransaction = {
    id: 1,
    clerkId: 'user123',
    name: 'Monthly Rent',
    amountCAD: createDecimal(1500),
    amountUSD: createDecimal(1200),
    categoryId: 2,
    notes: 'Test notes',
    dayOfMonth: 1,
    type: TransactionType.EXPENSE,
    createdAt: testDate
  };
  
  it('converts Prisma entity to domain entity', () => {
    const domain = RecurringTransactionMapper.toDomain(prismaRecurringTransactionData as any);
    
    expect(domain).toBeInstanceOf(RecurringTransaction);
    expect(domain.id).toBe(1);
    expect(domain.clerkId).toBe('user123');
    expect(domain.name).toBe('Monthly Rent');
    expect(domain.amountCAD).toBe(1500);
    expect(domain.amountUSD).toBe(1200);
    expect(domain.categoryId).toBe(2);
    expect(domain.notes).toBe('Test notes');
    expect(domain.dayOfMonth).toBe(1);
    expect(domain.type).toBe(TransactionType.EXPENSE);
    expect(domain.createdAt).toEqual(testDate);
  });
  
  it('converts domain entity to persistence data', () => {
    const domain = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      amountUSD: 1200,
      categoryId: 2,
      notes: 'Test notes',
      dayOfMonth: 1,
      type: TransactionType.EXPENSE,
      createdAt: testDate
    });
    
    const persistence = RecurringTransactionMapper.toPersistence(domain);
    
    expect(persistence).toEqual({
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      amountUSD: 1200,
      categoryId: 2,
      notes: 'Test notes',
      dayOfMonth: 1,
      type: 'expense'
    });
  });
  
  it('handles null notes in prisma entity', () => {
    const prismaWithNullNotes = {
      ...prismaRecurringTransactionData,
      notes: null
    };
    
    const domain = RecurringTransactionMapper.toDomain(prismaWithNullNotes as any);
    expect(domain.notes).toBeUndefined();
  });
  
  it('converts domain entity to DTO', () => {
    const domain = new RecurringTransaction({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      amountUSD: 1200,
      categoryId: 2,
      notes: 'Test notes',
      dayOfMonth: 1,
      type: TransactionType.EXPENSE,
      createdAt: testDate
    });
    
    const dto = RecurringTransactionMapper.toDTO(domain);
    
    expect(dto).toEqual({
      id: 1,
      clerkId: 'user123',
      name: 'Monthly Rent',
      amountCAD: 1500,
      amountUSD: 1200,
      categoryId: 2,
      notes: 'Test notes',
      dayOfMonth: 1,
      type: 'expense',
      createdAt: testDate.toISOString()
    });
  });
}); 