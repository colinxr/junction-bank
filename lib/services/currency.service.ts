interface ExchangeRateCache {
  rate: number;
  timestamp: number;
  expiresAt: number;
}

export class CurrencyService {
  private static exchangeRateCache: ExchangeRateCache | null = null;
  private static CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Gets the current USD to CAD exchange rate, using a cached value if available
   * @returns The exchange rate as a number
   */
  static async getUsdToCadExchangeRate(): Promise<number> {
    // Check if we have a cached rate that hasn't expired
    if (
      CurrencyService.exchangeRateCache && 
      CurrencyService.exchangeRateCache.expiresAt > Date.now()
    ) {
      console.log("Using cached exchange rate:", CurrencyService.exchangeRateCache.rate);
      return CurrencyService.exchangeRateCache.rate;
    }

    try {
      // Fetch fresh exchange rate from API
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const rate = data.rates.CAD;
      
      // Cache the new rate
      CurrencyService.exchangeRateCache = {
        rate,
        timestamp: Date.now(),
        expiresAt: Date.now() + CurrencyService.CACHE_TTL
      };
      
      console.log("Fetched new exchange rate:", rate);
      return rate;
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
      // Fallback to a reasonable default rate if API fails
      return 1.35; // Approximate CAD/USD rate
    }
  }

  /**
   * Converts USD amount to CAD using current exchange rate
   * @param usdAmount Amount in USD
   * @returns Equivalent amount in CAD
   */
  static async convertUsdToCad(usdAmount: number): Promise<number> {
    const exchangeRate = await CurrencyService.getUsdToCadExchangeRate();
    return Number((usdAmount * exchangeRate).toFixed(2));
  }

  static async convertAmount(amount_cad?: number, amount_usd?: number): Promise<number> {
    if (!amount_cad && amount_usd) {
      return await this.convertUsdToCad(amount_usd);
    } else if (!amount_cad) {
      throw new Error("Either CAD or USD amount must be provided");
    }
    return amount_cad;
  }
} 