import { Prisma } from '@prisma/client';
import { TransactionType } from '../Entities/Transaction';

/**
 * Core Transaction interface - Database-aligned base type
 * Serves as the source of truth for all transaction operations
 */
export interface CoreTransaction {
  id?: number;                // Optional for creates
  clerkId: string;            // Required
  name: string;               // Required
  amountCAD?: number | null;  // Optional - can be converted from USD
  amountUSD?: number | null;  // Optional - explicit null for database alignment
  categoryId: number;         // Required
  notes?: string | null;      // Optional - explicit null for database alignment
  date: Date;                 // Internal use - always Date type
  type: TransactionType;      // Strict enum
  monthId: number;            // Required
}

/**
 * Prisma-generated types for repository operations
 * These types match exactly what Prisma returns with includes
 */
export type TransactionWithCategory = Prisma.TransactionGetPayload<{
  include: { category: { select: { name: true } } }
}>;

export type TransactionCreateInput = Prisma.TransactionCreateInput;
export type TransactionUpdateInput = Prisma.TransactionUpdateInput;

// Validation functions moved to transactionValidators.ts
export { validateCoreTransaction } from './transactionValidators';
