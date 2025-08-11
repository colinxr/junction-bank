import { Transaction } from '../Entities/Transaction';
import { TransactionDTO, TransactionCreateDTO } from '../DTOs/TransactionDTO';
import { TransactionImportDTO } from '../DTOs/TransactionImportDTO';
import { CoreTransaction } from '../Validators/types';
import { TransactionType } from '../Entities/Transaction';

/**
 * Factory for creating Transaction (domain entity)
 */
export const mockTransaction = (overrides: Partial<Transaction> = {}): Transaction => {
  return Transaction.create({
    id: 1,
    clerkId: 'user_123',
    name: 'Test Transaction',
    amountCAD: 100,
    amountUSD: null,
    categoryId: 1,
    categoryName: 'Food',
    notes: null,
    type: TransactionType.EXPENSE,
    date: new Date('2025-01-01'),
    monthId: 202501,
    createdAt: new Date('2025-01-01'),
    ...overrides
  });
};

/**
 * Factory for creating TransactionDTO (API response)
 */
export const mockTransactionDTO = (overrides: Partial<TransactionDTO> = {}): TransactionDTO => ({
  id: 1,
  name: 'Test Transaction',
  amountCAD: 100,
  amountUSD: null,
  categoryId: 1,
  categoryName: 'Food',
  notes: null,
  type: TransactionType.EXPENSE,
  date: '2025-01-01T00:00:00.000Z',
  ...overrides
});

/**
 * Factory for creating TransactionCreateDTO (API input)
 */
export const mockTransactionCreateDTO = (overrides: Partial<TransactionCreateDTO> = {}): TransactionCreateDTO => ({
  clerkId: 'user_123',
  name: 'Test Transaction',
  amountCAD: 100,
  categoryId: 1,
  notes: null,
  type: TransactionType.EXPENSE,
  date: '2025-01-01T00:00:00.000Z',
  monthId: 1,
  ...overrides
});

/**
 * Factory for creating TransactionImportDTO (CSV import)
 */
export const mockTransactionImportDTO = (overrides: Partial<TransactionImportDTO> = {}): TransactionImportDTO => ({
  clerkId: 'user_123',
  name: 'Test Transaction',
  amountCAD: 100,
  amountUSD: null,
  categoryId: 1,
  notes: null,
  type: TransactionType.EXPENSE,
  date: new Date('2025-01-01'),
  monthId: 1,
  ...overrides
});

/**
 * Factory for creating CoreTransaction (domain core)
 */
export const mockCoreTransaction = (overrides: Partial<CoreTransaction> = {}): CoreTransaction => ({
  id: 1,
  clerkId: 'user_123',
  name: 'Test Transaction',
  amountCAD: 100,
  amountUSD: null,
  categoryId: 1,
  notes: null,
  type: TransactionType.EXPENSE,
  date: new Date('2025-01-01'),
  monthId: 1,
  ...overrides
});

/**
 * Factory for arrays of transactions
 */
export const mockTransactions = (count: number = 3, overrides: Partial<Transaction> = {}): Transaction[] => {
  return Array.from({ length: count }, (_, index) => 
    mockTransaction({ 
      id: index + 1, 
      name: `Test Transaction ${index + 1}`,
      ...overrides 
    })
  );
};
