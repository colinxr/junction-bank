import { CoreTransaction } from './types';
import { TransactionType } from '../Entities/Transaction';

/**
 * Type guard to validate TransactionType enum values
 */
export function isValidTransactionType(type: string): type is TransactionType {
  return type === 'Income' || type === 'Expense';
}

/**
 * Validates that a CoreTransaction has either amountCAD or amountUSD
 * Throws an error if both are missing/null/undefined
 */
export function validateCoreTransaction(tx: Partial<CoreTransaction>): asserts tx is CoreTransaction {
  if ((!tx.amountCAD || tx.amountCAD === 0) && (!tx.amountUSD || tx.amountUSD === 0)) {
    throw new Error("Either amountCAD or amountUSD must be provided");
  }
  
  // Additional required field validation
  if (!tx.clerkId) throw new Error("clerkId is required");
  if (!tx.name) throw new Error("name is required");
  if (!tx.categoryId) throw new Error("categoryId is required");
  if (!tx.date) throw new Error("date is required");
  if (!tx.type) throw new Error("type is required");
  if (!tx.monthId) throw new Error("monthId is required");
}

/**
 * Validates that at least one amount field is provided for transactions
 */
export function validateAmountFields(amountCAD?: number | null, amountUSD?: number | null): void {
  if ((!amountCAD || amountCAD === 0) && (!amountUSD || amountUSD === 0)) {
    throw new Error("Either amountCAD or amountUSD must be provided");
  }
}
