import { ExchangeRate, ExchangeRateVO } from "../Entity/ExchangeRate";
import { ExchangeRateFetchException, StaleExchangeRateException } from "../Exception/CurrencyException";
import { IExchangeRateApiService } from "../Service/IExchangeRateApiService";

export class GetUsdToCadRate {
  constructor(private readonly exchangeRateApiService: IExchangeRateApiService) {}

  /**
   * Executes the use case to get the current USD to CAD exchange rate
   * @throws {ExchangeRateFetchException} When unable to fetch rate
   * @throws {StaleExchangeRateException} When rate is stale and unable to refresh
   */
  async execute(): Promise<ExchangeRate> {
    try {
      const rate = await this.exchangeRateApiService.getUsdToCadRate();
      
      if (rate instanceof ExchangeRateVO && rate.isExpired()) {
        try {
          await this.exchangeRateApiService.clearCache();
          return await this.exchangeRateApiService.getUsdToCadRate();
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