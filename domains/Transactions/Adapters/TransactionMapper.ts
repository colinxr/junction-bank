import { Transaction, TransactionType } from '../Entities/Transaction';
import { TransactionDTO } from '../DTOs/TransactionDTO';
import { TransactionWithCategory } from '../Validators/types';
import { CategorySpendingDTO } from '../DTOs/TransactionDTO';

/**
 * Mapper class for converting between different Transaction representations
 * Handles conversions between Prisma models, domain entities, and DTOs
 */
export class TransactionMapper {
  
  /**
   * Maps a Prisma transaction result to a domain Transaction entity
   */
  static toDomain(prismaTransaction: TransactionWithCategory): Transaction {
    return Transaction.create({
      id: prismaTransaction.id,
      clerkId: prismaTransaction.clerkId,
      name: prismaTransaction.name,
      amountCAD: Number(prismaTransaction.amountCAD),
      amountUSD: prismaTransaction.amountUSD ? Number(prismaTransaction.amountUSD) : null,
      categoryId: prismaTransaction.categoryId,
      categoryName: prismaTransaction.category?.name,
      notes: prismaTransaction.notes,
      type: prismaTransaction.type === 'Income' ? TransactionType.INCOME : TransactionType.EXPENSE,
      date: prismaTransaction.date,
      monthId: prismaTransaction.monthId,
      createdAt: prismaTransaction.createdAt,
    });
  }

  /**
   * Converts domain entity to persistence format
   */
  static toPersistence(transaction: Transaction): {
    clerkId: string;
    name: string;
    amountCAD: number;
    amountUSD: number | null;
    categoryId: number;
    notes: string | null;
    type: string;
    date: Date;
    monthId: number;
  } {
    if (!transaction.date || !transaction.monthId) {
      throw new Error('Transaction date and monthId are required for persistence');
    }
    
    return {
      clerkId: transaction.clerkId,
      name: transaction.name,
      amountCAD: transaction.amountCAD,
      amountUSD: transaction.amountUSD ?? null,
      categoryId: transaction.categoryId,
      notes: transaction.notes ?? null,
      type: transaction.type.toString(),
      date: transaction.date,
      monthId: transaction.monthId
    };
  }

  /**
   * Maps a domain Transaction entity to a TransactionDTO
   */
  static toDTO(transaction: Transaction): TransactionDTO {
    return {
      id: transaction.id!,
      name: transaction.name,
      amountCAD: transaction.amountCAD,
      amountUSD: transaction.amountUSD,
      categoryId: transaction.categoryId,
      categoryName: transaction.categoryName,
      notes: transaction.notes,
      type: transaction.type,
      date: transaction.date?.toISOString(),
    };
  }

  /**
   * Maps a Prisma transaction result directly to a TransactionDTO (for API responses)
   */
  static toDTOFromRaw(raw: TransactionWithCategory): TransactionDTO {
    return {
      id: raw.id,
      name: raw.name,
      amountCAD: Number(raw.amountCAD),
      amountUSD: raw.amountUSD ? Number(raw.amountUSD) : null,
      categoryId: raw.categoryId,
      categoryName: raw.category?.name,
      notes: raw.notes,
      type: raw.type,
      date: raw.date?.toISOString(),
    };
  }

  /**
   * Maps an array of Prisma transaction results to TransactionDTOs
   */
  static toDTOs(transactions: TransactionWithCategory[]): TransactionDTO[] {
    return transactions.map(TransactionMapper.toDTOFromRaw);
  }

  /**
   * Maps a domain Transaction entity to a CategorySpendingDTO
   */
  static toCategorySpendingDTO(transaction: Transaction, totalSpent: number, transactionCount: number): CategorySpendingDTO {
    return {
      categoryId: transaction.categoryId,
      categoryName: transaction.categoryName || '',
      totalSpent,
      transactionCount,
    };
  }
}

/**
 * Legacy function exports for backward compatibility
 */
export function toTransactionDTO(transaction: Transaction): TransactionDTO {
  return TransactionMapper.toDTO(transaction);
}

export function toTransactionDTOs(transactions: Transaction[]): TransactionDTO[] {
  return transactions.map(transaction => TransactionMapper.toDTO(transaction));
}