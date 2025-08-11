import { Transaction, TransactionType } from '../Entities/Transaction';
import { TransactionDTO, CategorySpendingDTO } from '../DTOs/TransactionDTO';
import { TransactionModel } from '../Entities/TransactionModel';

/**
 * Mapper class for converting between different Transaction representations
 * Handles conversions between Prisma models, domain entities, and DTOs
 */
export class TransactionMapper {
  
  /**
   * Converts Prisma/DB model to domain entity
   */
  static toDomain(prismaTransaction: TransactionModel): Transaction {
    return new Transaction({
      id: prismaTransaction.id,
      clerkId: prismaTransaction.clerkId,
      name: prismaTransaction.name,
      amountCAD: Number(prismaTransaction.amountCAD),
      amountUSD: prismaTransaction.amountUSD ? Number(prismaTransaction.amountUSD) : undefined,
      categoryId: prismaTransaction.categoryId,
      categoryName: prismaTransaction.category?.name,
      notes: prismaTransaction.notes || undefined, // Convert null to undefined
      type: prismaTransaction.type as TransactionType,
      date: prismaTransaction.date,
      monthId: prismaTransaction.monthId,
      createdAt: prismaTransaction.createdAt
    });
  }

  /**
   * Converts domain entity to persistence format
   */
  static toPersistence(transaction: Transaction): any {
    return {
      clerkId: transaction.clerkId,
      name: transaction.name,
      amountCAD: transaction.amountCAD,
      amountUSD: transaction.amountUSD,
      categoryId: transaction.categoryId,
      notes: transaction.notes,
      type: transaction.type.toString(),
      date: transaction.date,
      monthId: transaction.monthId
    };
  }

  /**
   * Converts domain entity to API DTO
   */
  static toDTO(transaction: Transaction): TransactionDTO {
    return {
      id: transaction.id!,
      name: transaction.name,
      amountCAD: Number(transaction.amountCAD),
      amountUSD: transaction.amountUSD ? Number(transaction.amountUSD) : undefined,
      categoryId: transaction.categoryId,
      categoryName: transaction.categoryName || (transaction as any).category?.name,
      notes: transaction.notes || undefined,
      type: transaction.type.toString(),
      date: transaction.date.toISOString()
    };
  }

  /**
   * Converts category spending data to DTO
   * Handles Prisma aggregation results with _sum and _count
   */
  static toCategorySpendingDTO(spendingData: any): CategorySpendingDTO {
    return {
      categoryId: spendingData.categoryId,
      categoryName: spendingData.categoryName,
      totalSpent: Number(spendingData._sum?.amountCAD || 0),
      transactionCount: spendingData._count?.amountUSD || 0
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