import { describe, it, expect } from 'vitest';
import { validateCoreTransaction, CoreTransaction } from './types';

describe('CoreTransaction', () => {
  it('rejects transactions without amountCAD or amountUSD', () => {
    const invalidTx = { 
      clerkId: "user_123", 
      name: "Test Transaction",
      categoryId: 1,
      type: "Expense" as const,
      date: new Date(),
      monthId: 1
    } as Partial<CoreTransaction>;

    expect(() => validateCoreTransaction(invalidTx)).toThrow("Either amountCAD or amountUSD must be provided");
  });

  it('accepts transactions with only amountCAD', () => {
    const validTx = {
      clerkId: "user_123",
      name: "Test Transaction", 
      amountCAD: 100,
      categoryId: 1,
      notes: null,
      type: "Expense" as const,
      date: new Date(),
      monthId: 1
    } as Partial<CoreTransaction>;

    expect(() => validateCoreTransaction(validTx)).not.toThrow();
  });

  it('accepts transactions with only amountUSD', () => {
    const validTx = {
      clerkId: "user_123",
      name: "Test Transaction",
      amountUSD: 75,
      categoryId: 1,
      notes: null,
      type: "Expense" as const,
      date: new Date(),
      monthId: 1
    } as Partial<CoreTransaction>;

    expect(() => validateCoreTransaction(validTx)).not.toThrow();
  });

  it('accepts transactions with both amounts', () => {
    const validTx = {
      clerkId: "user_123",
      name: "Test Transaction",
      amountCAD: 100,
      amountUSD: 75,
      categoryId: 1,
      notes: null,
      type: "Expense" as const,
      date: new Date(),
      monthId: 1
    } as Partial<CoreTransaction>;

    expect(() => validateCoreTransaction(validTx)).not.toThrow();
  });
});
