import { CoreTransaction } from '../Validators/types';
import { TransactionCreateDTO } from '../DTOs/TransactionDTO';
import { isValidTransactionType } from '../Validators/transactionValidators';

/**
 * Converts API DTO to domain CoreTransaction
 */
export function toCoreTransaction(dto: TransactionCreateDTO): CoreTransaction {
  // Validate date format
  const date = new Date(dto.date);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  return {
    clerkId: dto.clerkId,
    name: dto.name,
    amountCAD: dto.amountCAD,
    amountUSD: dto.amountUSD,
    categoryId: dto.categoryId,
    notes: dto.notes,
    type: dto.type as any, // Will be validated by domain
    date: date,
    monthId: dto.monthId,
  };
}

/**
 * Updates an existing CoreTransaction with new data
 */
export function updateCoreTransaction(
  existing: CoreTransaction, 
  dto: Partial<TransactionCreateDTO>
): CoreTransaction {
  const result = { ...existing };

  if (dto.name !== undefined) result.name = dto.name;
  if (dto.amountCAD !== undefined) result.amountCAD = dto.amountCAD;
  if (dto.amountUSD !== undefined) result.amountUSD = dto.amountUSD;
  if (dto.categoryId !== undefined) result.categoryId = dto.categoryId;
  if (dto.notes !== undefined) result.notes = dto.notes;
  if (dto.type !== undefined) {
    if (!isValidTransactionType(dto.type)) {
      throw new Error('Invalid transaction type');
    }
    result.type = dto.type as any;
  }
  if (dto.date !== undefined) {
    const date = new Date(dto.date);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    result.date = date;
  }
  if (dto.monthId !== undefined) result.monthId = dto.monthId;

  return result;
}
