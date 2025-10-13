import { CoreTransaction } from '../Validators/types';
import { TransactionCreateDTO } from '../DTOs/TransactionDTO';
import { isValidTransactionType } from '../Validators/transactionValidators';
import { cleanUpdateData } from '../../Shared/Utils/cleanUpdateData';

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

  const updates = cleanUpdateData(dto, {
    type: (value) => {
      if (!isValidTransactionType(value)) {
        throw new Error('Invalid transaction type');
      }
      return value as any;
    },
    date: (value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      return date;
    }
  }) as Partial<CoreTransaction>;

  return { ...result, ...updates };
}
