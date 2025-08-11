import { Transaction, TransactionType } from '../Transaction';
import { TransactionModel } from '../TransactionModel';
import { TransactionDTO, TransactionCreateDTO } from '../TransactionDTO';
import { TransactionImportDTO } from '../TransactionImportDTO';
import { CoreTransaction } from '../types';

/**
 * Factory for creating Transaction entities (database model)
 */
export const mockTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 1,
  clerkId: 'user_123',
  monthId: 1,
  name: 'Test Transaction',
  amountCAD: 100,
  amountUSD: null,
  categoryId: 1,
  notes: null,
  date: new Date('2025-01-01'),
  createdAt: new Date(),
  type: TransactionType.EXPENSE,
  // Relations
  category: {
    id: 1,
    name: 'Food',
    type: 'expense',
    notes: null,
    createdAt: new Date(),
    isRecurring: false,
    transactions: [],
    recurringTransactions: []
  },
  month: {
    id: 1,
    month: 1,
    year: 2025,
    notes: null,
    createdAt: new Date(),
    totalExpenses: 0,
    totalIncome: 0,
    transactionCount: 0,
    recurringExpenses: 0,
    transactions: []
  },
  ...overrides
});

/**
 * Factory for creating TransactionModel (repository layer)
 */
export const mockTransactionModel = (overrides: Partial<TransactionModel> = {}): TransactionModel => ({
  id: 1,
  clerkId: 'user_123',
  monthId: 1,
  name: 'Test Transaction',
  amountCAD: 100,
  amountUSD: null,
  categoryId: 1,
  categoryName: 'Food',
  notes: null,
  date: new Date('2025-01-01'),
  type: TransactionType.EXPENSE,
  ...overrides
});

/**
 * Factory for creating TransactionDTO (API response)
 */
export const mockTransactionDTO = (overrides: Partial<TransactionDTO> = {}): TransactionDTO => ({
  id: 1,
  name: 'Test Transaction',
  amountCAD: 100,
  amountUSD: undefined,
  categoryId: 1,
  categoryName: 'Food',
  notes: undefined,
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
  notes: undefined,
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

/**
 * Factory for arrays of transaction models
 */
export const mockTransactionModels = (count: number = 3, overrides: Partial<TransactionModel> = {}): TransactionModel[] => {
  return Array.from({ length: count }, (_, index) => 
    mockTransactionModel({ 
      id: index + 1, 
      name: `Test Transaction ${index + 1}`,
      ...overrides 
    })
  );
};
