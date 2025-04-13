import { Transaction as TransactionEntity, TransactionType } from '@/domain/entities/Transaction';
import { Transaction } from '../../app/types';
import { TransactionDTO, CategorySpendingDTO } from '@/application/dtos/transaction/TransactionDTO';
import { TransactionModel } from '../persistence/TransactionModel';

type TransactionSource = Partial<TransactionEntity> | Partial<TransactionModel>;

export class TransactionMapper {
  // Convert from database model to domain entity
  static toDomain(model: TransactionModel): TransactionEntity {
    const getNumber = (val: any): number => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return val;
      if (typeof val.toString === 'function') return parseFloat(val.toString());
      return 0;
    };

    return TransactionEntity.create({
      id: model.id,
      userId: model.userId,
      name: model.name,
      amountCAD: getNumber(model.amountCAD),
      amountUSD: model.amountUSD ? getNumber(model.amountUSD) : undefined,
      categoryId: model.categoryId,
      categoryName: model.category?.name ?? '',
      notes: model.notes || undefined,
      type: model.type as TransactionType,
      date: model.date,
      monthId: model.monthId,
      createdAt: model.createdAt
    });
  }

  // Convert from domain entity to database model
  static toPersistence(entity: Partial<Transaction>): Omit<TransactionModel, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      userId: entity.userId!,
      name: entity.name!,
      amountCAD: entity.amountCAD!,
      amountUSD: entity.amountUSD || null,
      categoryId: entity.categoryId!,
      notes: entity.notes || null,
      type: entity.type!.toString(),
      date: entity.date!,
      monthId: entity.monthId!
    };
  }

  // Convert from domain entity or DB model to DTO for API responses
  static toDTO(source: TransactionSource): TransactionDTO {
    const getNumberValue = (val: any): number | undefined => {
      if (val === null || val === undefined) return undefined;
      if (typeof val === 'number') return val;
      if (typeof val.toString === 'function') return parseFloat(val.toString());
      return undefined;
    };

    // Handle both Transaction class and database model
    if (source instanceof TransactionEntity) {
      return {
        id: source.id!,
        userId: source.userId,
        name: source.name,
        amountCAD: source.amountCAD,
        amountUSD: source.amountUSD,
        categoryId: source.categoryId,
        notes: source.notes,
        type: source.type.toString(),
        date: source.date ? source.date.toISOString() : new Date().toISOString(),
        monthId: source.monthId || 0
      };
    } else {
      // Handle database model
      return {
        id: source.id!,
        userId: source.userId!,
        name: source.name!,
        amountCAD: getNumberValue(source.amountCAD)!,
        amountUSD: getNumberValue(source.amountUSD),
        categoryId: source.categoryId!,
        notes: source.notes || undefined,
        type: String(source.type),
        date: source.date instanceof Date ? source.date.toISOString() : String(source.date),
        monthId: source.monthId!
      };
    }
  }
  
  // Convert spending data to CategorySpendingDTO
  static toCategorySpendingDTO(data: any): CategorySpendingDTO {
    return {
      categoryId: data.categoryId,
      categoryName: data.categoryName || '',
      totalSpent: data._sum?.amountCAD || 0,
      transactionCount: data._count?.amountUSD || 0
    };
  }
} 