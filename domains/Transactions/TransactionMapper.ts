import { Transaction } from './Transaction';
import { TransactionDTO } from './TransactionDTO';

/**
 * Converts a database Transaction to a TransactionDTO for API responses
 * - Converts null notes to undefined for API cleanliness
 * - Converts Date to ISO string
 * - Converts Decimal amounts to numbers
 * - Includes category name if available
 */
export function toTransactionDTO(transaction: Transaction): TransactionDTO {
  return {
    id: transaction.id,
    name: transaction.name,
    amountCAD: Number(transaction.amountCAD), // Convert Prisma Decimal to number
    amountUSD: transaction.amountUSD ? Number(transaction.amountUSD) : undefined,
    categoryId: transaction.categoryId,
    categoryName: transaction.category?.name,
    notes: transaction.notes || undefined, // Convert null to undefined for API
    type: transaction.type,
    date: transaction.date.toISOString(), // Convert Date to ISO string
  };
}

/**
 * Converts an array of database Transactions to TransactionDTOs
 */
export function toTransactionDTOs(transactions: Transaction[]): TransactionDTO[] {
  return transactions.map(toTransactionDTO);
}