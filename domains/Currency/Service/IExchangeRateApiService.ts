import { ExchangeRate } from "../Entity/ExchangeRate";

export interface IExchangeRateApiService {
  /**
   * Fetches the current USD to CAD exchange rate
   * Should implement caching behavior internally
   * @throws {ExchangeRateFetchException} When unable to fetch rate
   * @returns Promise<ExchangeRate>
   */
  getUsdToCadRate(): Promise<ExchangeRate>;

  /**
   * Clears any cached exchange rates
   */
  clearCache(): Promise<void>;
} 