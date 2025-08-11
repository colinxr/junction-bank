import { TransactionType } from '../Entities/Transaction';

/**
 * Core Transaction interface - Database-aligned base type
 * Serves as the source of truth for all transaction operations
 */
export interface CoreTransaction {
  id?: number;                // Optional for creates
  clerkId: string;            // Required
  name: string;               // Required
  amountCAD?: number;         // Optional - can be converted from USD
  amountUSD?: number | null;  // Optional - explicit null for database alignment
  categoryId: number;         // Required
  notes?: string | null;      // Optional - explicit null for database alignment
  date: Date;                 // Internal use - always Date type
  type: TransactionType;      // Strict enum
  monthId: number;            // Required
}

// Validation functions moved to transactionValidators.ts
export { validateCoreTransaction } from './transactionValidators';
