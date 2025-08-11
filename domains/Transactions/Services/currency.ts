import { TransactionImportDTO } from '../TransactionImportDTO';
import { CoreTransaction } from '../types';
import { CurrencyService } from '@/domains/Currency/Service/CurrencyService';

/**
 * Ensures that a transaction has amountCAD populated
 * Converts USD to CAD if only amountUSD is provided
 * 
 * @param dto - Transaction import DTO that may have only USD amounts
 * @param currencyService - Currency service for USD to CAD conversion
 * @returns CoreTransaction with guaranteed amountCAD
 * @throws Error if both amountCAD and amountUSD are missing/null
 */
export async function ensureAmountCAD(
  dto: TransactionImportDTO, 
  currencyService: CurrencyService
): Promise<CoreTransaction> {
  // Use the existing CurrencyService to handle conversion logic
  const currencyData = await currencyService.processCurrencyAmounts(
    dto.amountCAD ?? undefined,
    dto.amountUSD ?? undefined
  );

  // Ensure amountCAD is always defined (CurrencyService guarantees this)
  if (!currencyData.amountCAD) {
    throw new Error("Currency conversion failed - amountCAD is missing");
  }

  return {
    ...dto,
    amountCAD: currencyData.amountCAD,
    amountUSD: currencyData.amountUSD ?? null, // Convert undefined to null for database
  };
}
