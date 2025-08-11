import { describe, it, expect } from 'vitest';
import { TransactionMapper } from './TransactionMapper';
import { Transaction, TransactionType } from '../Entities/Transaction';
import { TransactionModel } from '../Entities/TransactionModel';

describe('TransactionMapper', () => {
  const testDate = new Date('2023-01-01');
  const monthId = 202301;
  
  // Mock database model with necessary properties
  const prismaTransactionData = {
    id: 1,
    clerkId: 'user123',
    name: 'Groceries',
    amountCAD: 50,
    amountUSD: 38,
    categoryId: 1,
    notes: 'Weekly shopping',
    type: TransactionType.EXPENSE,
    date: testDate,
    monthId: monthId,
    createdAt: testDate,
    category: {
      name: 'Food'
    }
  } as unknown as TransactionModel;
  
  it('converts Prisma entity to domain entity', () => {
    const domain = TransactionMapper.toDomain(prismaTransactionData);
    
    expect(domain).toBeInstanceOf(Transaction);
    expect(domain.id).toBe(1);
    expect(domain.clerkId).toBe('user123');
    expect(domain.name).toBe('Groceries');
    expect(domain.amountCAD).toBe(50);
    expect(domain.amountUSD).toBe(38);
    expect(domain.categoryId).toBe(1);
    expect(domain.categoryName).toBe('Food');
    expect(domain.notes).toBe('Weekly shopping');
    expect(domain.type).toBe(TransactionType.EXPENSE);
    expect(domain.date).toEqual(testDate);
    expect(domain.monthId).toBe(monthId);
    expect(domain.createdAt).toEqual(testDate);
  });
  
  it('converts domain entity to persistence data', () => {
    const domain = new Transaction({
      clerkId: 'user123',
      name: 'Groceries',
      amountCAD: 50,
      amountUSD: 38,
      categoryId: 1,
      notes: 'Weekly shopping',
      type: TransactionType.EXPENSE,
      date: testDate,
      monthId: monthId
    });
    
    const persistence = TransactionMapper.toPersistence(domain);
    
    expect(persistence).toEqual({
      clerkId: 'user123',
      name: 'Groceries',
      amountCAD: 50,
      amountUSD: 38,
      categoryId: 1,
      notes: 'Weekly shopping',
      type: TransactionType.EXPENSE.toString(),
      date: testDate,
      monthId: monthId
    });
  });
  
  it('handles null notes in prisma entity', () => {
    const prismaWithNullNotes = {
      ...prismaTransactionData,
      notes: null
    } as unknown as TransactionModel;
    
    const domain = TransactionMapper.toDomain(prismaWithNullNotes);
    expect(domain.notes).toBeUndefined();
  });
  
  it('converts domain entity to DTO', () => {
    const domain = new Transaction({
      id: 1,
      clerkId: 'user123',
      name: 'Groceries',
      amountCAD: 50,
      amountUSD: 38,
      categoryId: 1,
      categoryName: 'Food',
      notes: 'Weekly shopping',
      type: TransactionType.EXPENSE,
      date: testDate,
      monthId: monthId,
      createdAt: testDate
    });

    console.log(domain);
    
    
    const dto = TransactionMapper.toDTO(domain);
    console.log(dto);
    
    expect(dto).toEqual({
      id: 1,
      name: 'Groceries',
      amountCAD: 50,
      amountUSD: 38,
      categoryId: 1,
      categoryName: 'Food',
      notes: 'Weekly shopping',
      type: TransactionType.EXPENSE.toString(),
      date: testDate.toISOString()
    });
  });
  
  it('can convert category spending data to DTO', () => {
    const spendingData = {
      categoryId: 1,
      categoryName: 'Food',
      _sum: { amountCAD: 100 },
      _count: { amountUSD: 5 }
    };

    const result = TransactionMapper.toCategorySpendingDTO(spendingData);
    
    expect(result).toEqual({
      categoryId: 1,
      categoryName: 'Food',
      totalSpent: 100,
      transactionCount: 5
    });
  });

  it('can convert raw database result directly to DTO', () => {
    const rawDbResult = {
      id: 1,
      name: 'Test Transaction',
      amount_cad: 100,
      amount_usd: 75,
      category_id: 2,
      category: { name: 'Test Category' },
      notes: 'Test notes',
      type: 'Expense',
      date: new Date('2023-01-01')
    };

    const result = TransactionMapper.toDTOFromRaw(rawDbResult);
    
    expect(result).toEqual({
      id: 1,
      name: 'Test Transaction',
      amountCAD: 100,
      amountUSD: 75,
      categoryId: 2,
      categoryName: 'Test Category',
      notes: 'Test notes',
      type: 'Expense',
      date: '2023-01-01T00:00:00.000Z'
    });
  });
}); 