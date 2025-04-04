import { RecurringTransaction as PrismaRecurringTransaction } from '@prisma/client';
import { RecurringTransaction, TransactionType } from '../../domain/entities/RecurringTransaction';
import { RecurringTransactionDTO } from '../../application/dtos/recurringTransaction/RecurringTransactionDTO';

export class RecurringTransactionMapper {
  static toDomain(raw: PrismaRecurringTransaction): RecurringTransaction {
    return new RecurringTransaction({
      id: raw.id,
      userId: raw.userId,
      name: raw.name,
      amountCAD: Number(raw.amountCAD),
      amountUSD: raw.amountUSD ? Number(raw.amountUSD) : undefined,
      categoryId: raw.categoryId,
      notes: raw.notes || undefined,
      dayOfMonth: raw.dayOfMonth || undefined,
      type: raw.type as TransactionType,
      createdAt: raw.createdAt
    });
  }

  static toPersistence(recurringTransaction: Omit<RecurringTransaction, 'id' | 'createdAt'>): {
    userId: string;
    name: string;
    amountCAD: number;
    amountUSD?: number | null;
    categoryId: number;
    notes: string | null;
    dayOfMonth: number | null;
    type: string;
  } {
    return {
      userId: recurringTransaction.userId!,
      name: recurringTransaction.name,
      amountCAD: recurringTransaction.amountCAD,
      amountUSD: recurringTransaction.amountUSD || null,
      categoryId: recurringTransaction.categoryId,
      notes: recurringTransaction.notes || null,
      dayOfMonth: recurringTransaction.dayOfMonth || null,
      type: recurringTransaction.type
    };
  }

  static toDTO(domain: RecurringTransaction, categoryName?: string): RecurringTransactionDTO {
    return {
      id: domain.id!,
      userId: domain.userId!,
      name: domain.name,
      amountCAD: domain.amountCAD,
      amountUSD: domain.amountUSD,
      categoryId: domain.categoryId,
      categoryName,
      notes: domain.notes,
      dayOfMonth: domain.dayOfMonth,
      type: domain.type,
      createdAt: domain.createdAt?.toISOString()
    };
  }
} 