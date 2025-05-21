import { RecurringTransaction as PrismaRecurringTransaction } from '@prisma/client';
import { RecurringTransaction, TransactionType } from './RecurringTransaction';
import { RecurringTransactionDTO } from './RecurringTransactionDTO';

export class RecurringTransactionMapper {
  static toDomain(raw: PrismaRecurringTransaction): RecurringTransaction {
    return new RecurringTransaction({
      id: raw.id,
      clerkId: raw.clerkId,
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
    clerkId: string;
    name: string;
    amountCAD: number;
    amountUSD?: number | null;
    categoryId: number;
    notes: string | null;
    dayOfMonth: number | null;
    type: string;
  } {
    return {
      clerkId: recurringTransaction.clerkId!,
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
      clerkId: domain.clerkId!,
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