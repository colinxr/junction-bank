import { TransactionCreateDTO, UpdateTransactionDTO } from '@/domains/Transactions/TransactionDTO';
import { CoreTransaction } from '@/domains/Transactions/types';
import { TransactionType } from '@/domains/Transactions/Transaction';

/**
 * Converts API input DTO to CoreTransaction
 * - Parses ISO date strings to Date objects
 * - Validates transaction type enum
 * - Handles error cases with meaningful messages
 */
export function toCoreTransaction(dto: TransactionCreateDTO): CoreTransaction {
  // Validate and parse date with detailed error handling
  const date = parseISODate(dto.date);
  
  // Validate transaction type
  validateTransactionType(dto.type);

  return {
    clerkId: dto.clerkId,
    name: dto.name,
    amountCAD: dto.amountCAD,
    amountUSD: dto.amountUSD ?? undefined,
    categoryId: dto.categoryId,
    notes: dto.notes === null ? null : dto.notes, // Preserve null explicitly
    type: dto.type as TransactionType,
    date,
    monthId: dto.monthId,
  };
}

/**
 * Parses ISO date string with enhanced error handling
 */
function parseISODate(dateString: string): Date {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Date is required and must be a string');
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  return date;
}

/**
 * Validates transaction type with detailed error message
 */
function validateTransactionType(type: string): asserts type is TransactionType {
  if (!isValidTransactionType(type)) {
    throw new Error(`Invalid transaction type: ${type}. Must be 'Income' or 'Expense'`);
  }
}

/**
 * Type guard to validate TransactionType enum values
 */
function isValidTransactionType(type: string): type is TransactionType {
  return type === 'Income' || type === 'Expense';
}

/**
 * Converts UpdateTransactionDTO to partial CoreTransaction for updates
 * - Handles optional fields properly
 * - Maintains null vs undefined semantics
 */
export function toPartialCoreTransaction(dto: UpdateTransactionDTO): Partial<CoreTransaction> {
  const result: Partial<CoreTransaction> = {};

  if (dto.name !== undefined) result.name = dto.name;
  if (dto.amountCAD !== undefined) result.amountCAD = dto.amountCAD;
  if (dto.amountUSD !== undefined) result.amountUSD = dto.amountUSD;
  if (dto.categoryId !== undefined) result.categoryId = dto.categoryId;
  if (dto.notes !== undefined) result.notes = dto.notes;
  if (dto.type !== undefined) {
    if (!isValidTransactionType(dto.type)) {
      throw new Error(`Invalid transaction type: ${dto.type}`);
    }
    result.type = dto.type as TransactionType;
  }

  return result;
}
