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
  private async getUsdToCadExchangeRate(): Promise<number> {
    // Check if we have a cached rate that hasn't expired
    if (
      CurrencyService.exchangeRateCache && 
      CurrencyService.exchangeRateCache.expiresAt > Date.now()
    ) {
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
      
      return rate;
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
      return 1.35; // Approximate CAD/USD rate
    }
  }

  /**
   * Converts USD amount to CAD using current exchange rate
   * @param amount_usd Amount in USD
   * @returns Equivalent amount in CAD
   */
  private async convertUsdToCad(amountUSD: number): Promise<number> {
    const exchangeRate = await this.getUsdToCadExchangeRate();
    return Number((amountUSD * exchangeRate).toFixed(2));
  }

  async convertAmount(amountCAD?: number, amountUSD?: number): Promise<number> {
    if (!amountCAD && amountUSD) {
      return await this.convertUsdToCad(amountUSD);
    }
    
    if (!amountCAD) {
      throw new Error("Either CAD or USD amount must be provided");
    }
    
    return amountCAD;
  }
} 