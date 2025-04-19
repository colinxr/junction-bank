import { ExchangeRate, ExchangeRateVO } from "../Entity/ExchangeRate";
import { ExchangeRateFetchException, StaleExchangeRateException } from "../Exception/CurrencyException";
import { ICurrencyService } from "../Service/ICurrencyService";

export class GetUsdToCadRate {
  constructor(private readonly currencyService: ICurrencyService) {}

  /**
   * Executes the use case to get the current USD to CAD exchange rate
   * @throws {ExchangeRateFetchException} When unable to fetch rate
   * @throws {StaleExchangeRateException} When rate is stale and unable to refresh
   */
  async execute(): Promise<ExchangeRate> {
    try {
      const rate = await this.currencyService.getUsdToCadRate();
      
      if (rate instanceof ExchangeRateVO && rate.isExpired()) {
        try {
          await this.currencyService.clearCache();
          return await this.currencyService.getUsdToCadRate();
        } catch (error) {
          throw new StaleExchangeRateException();
        }
      }
      
      return rate;
    } catch (error) {
      if (error instanceof StaleExchangeRateException) {
        throw error;
      }
      throw new ExchangeRateFetchException(error instanceof Error ? error.message : "Failed to fetch exchange rate");
    }
  }
} 