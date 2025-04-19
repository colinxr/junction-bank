import { ExchangeRateVO } from "../Entity/ExchangeRate";
import { InvalidAmountException } from "../Exception/CurrencyException";
import { ExchangeRate } from "../Entity/ExchangeRate";

export class ConvertUsdToCad {
  /**
   * Converts a USD amount to CAD
   * @param amountUSD The amount in USD to convert
   * @param rate The exchange rate to use for conversion
   * @throws {InvalidAmountException} When amount is invalid
   * @throws {ExchangeRateFetchException} When unable to fetch rate
   * @throws {StaleExchangeRateException} When rate is stale
   */
  async execute(amountUSD: number, rate: ExchangeRate): Promise<number> {
    if (typeof amountUSD !== 'number' || isNaN(amountUSD)) {
      throw new InvalidAmountException("Amount must be a valid number");
    }

    if (amountUSD < 0) {
      throw new InvalidAmountException("Amount cannot be negative");
    }

    try {
      if (rate instanceof ExchangeRateVO) {
        return rate.convert(amountUSD);
      }
      
      // If we got a plain ExchangeRate interface, do the conversion manually
      return Number((amountUSD * rate.rate).toFixed(2));
    } catch (error) {
      // Re-throw domain exceptions
      if (error instanceof InvalidAmountException) {
        throw error;
      }
      throw error; // Let other domain exceptions propagate
    }
  }
} 