import { ExchangeRate, ExchangeRateVO } from "../Entity/ExchangeRate";
import { ExchangeRateFetchException } from "../Exception/CurrencyException";
import { IExchangeRateApiService } from "./IExchangeRateApiService";

export class ExchangeRateApiService implements IExchangeRateApiService {
  private cachedRate: ExchangeRateVO | null = null;
  private readonly apiUrl = "https://api.exchangerate-api.com/v4/latest/USD";

  /**
   * Fetches the current USD to CAD exchange rate
   * Implements caching with 24-hour expiry
   */
  async getUsdToCadRate(): Promise<ExchangeRate> {
    if (this.cachedRate && !this.cachedRate.isExpired()) {
      return this.cachedRate;
    }

    try {
      const response = await fetch(this.apiUrl);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.rates?.CAD) {
        throw new Error("CAD rate not found in response");
      }

      this.cachedRate = new ExchangeRateVO(data.rates.CAD);
      return this.cachedRate;
    } catch (error) {
      // If API call fails, use fallback rate
      console.warn("Failed to fetch exchange rate, using fallback rate:", error);
      this.cachedRate = ExchangeRateVO.createFallback();
      return this.cachedRate;
    }
  }

  /**
   * Clears the cached exchange rate
   */
  async clearCache(): Promise<void> {
    this.cachedRate = null;
  }
} 