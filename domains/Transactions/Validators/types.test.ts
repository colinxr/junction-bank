import { describe, it, expect } from 'vitest';
import { validateCoreTransaction, CoreTransaction } from './types';
import { mockCoreTransaction } from '../Factories/TransactionFactories';

describe('CoreTransaction', () => {
  it('rejects transactions without amountCAD or amountUSD', () => {
    const invalidTx = mockCoreTransaction({
      amountCAD: undefined,
      amountUSD: undefined
    }) as Partial<CoreTransaction>;

    expect(() => validateCoreTransaction(invalidTx)).toThrow("Either amountCAD or amountUSD must be provided");
  });

  it('accepts transactions with only amountCAD', () => {
    const validTx = mockCoreTransaction({
      amountCAD: 100
    });
    delete (validTx as any).amountUSD; // Remove amountUSD to test CAD-only case

    expect(() => validateCoreTransaction(validTx)).not.toThrow();
  });

  it('accepts transactions with only amountUSD', () => {
    const validTx = mockCoreTransaction({
      amountUSD: 75
    });
    delete (validTx as any).amountCAD; // Remove amountCAD to test USD-only case

    expect(() => validateCoreTransaction(validTx)).not.toThrow();
  });

  it('accepts transactions with both amounts', () => {
    const validTx = mockCoreTransaction({
      amountCAD: 100,
      amountUSD: 75
    });

    expect(() => validateCoreTransaction(validTx)).not.toThrow();
  });
});
