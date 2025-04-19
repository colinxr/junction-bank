import { ConvertUsdToCad } from "../Actions/ConvertUsdToCad";
import { GetUsdToCadRate } from "../Actions/GetUsdToCadRate";
import { ExchangeRate } from "../Entity/ExchangeRate";
import { InvalidAmountException } from "../Exception/CurrencyException";

export interface CurrencyAmount {
  amountCAD?: number;
  amountUSD?: number;
}

export class CurrencyService {
  private readonly convertUsdToCad: ConvertUsdToCad;
  
  constructor(getUsdToCadRate: GetUsdToCadRate) {
    this.convertUsdToCad = new ConvertUsdToCad(getUsdToCadRate);
  }

  /**
   * Ensures both CAD and USD values are present by converting as needed
   */
  async ensureBothCurrencies(amount: CurrencyAmount): Promise<{ amountCAD: number; amountUSD: number }> {
    if (amount.amountCAD !== undefined && amount.amountUSD !== undefined) {
      return { amountCAD: amount.amountCAD, amountUSD: amount.amountUSD };
    }
    
    if (amount.amountCAD !== undefined) {
      const amountUSD = await this.convertCadToUsd(amount.amountCAD);
      return { amountCAD: amount.amountCAD, amountUSD };
    }
    
    if (amount.amountUSD !== undefined) {
      const amountCAD = await this.convertUsdToCad.execute(amount.amountUSD);
      return { amountCAD, amountUSD: amount.amountUSD };
    }
    
    throw new InvalidAmountException("Either CAD or USD amount must be provided");
  }

  /**
   * Converts a USD amount to CAD
   */
  async convertUsdToCadAmount(amountUSD: number): Promise<number> {
    return await this.convertUsdToCad.execute(amountUSD);
  }

  /**
   * Converts a CAD amount to USD
   */
  async convertCadToUsd(amountCAD: number): Promise<number> {
    if (typeof amountCAD !== 'number' || isNaN(amountCAD)) {
      throw new InvalidAmountException("Amount must be a valid number");
    }

    if (amountCAD < 0) {
      throw new InvalidAmountException("Amount cannot be negative");
    }

    try {
      // Get the CAD/USD rate and invert it
      const rate = await this.convertUsdToCad.execute(1);
      return Number((amountCAD / rate).toFixed(2));
    } catch (error) {
      if (error instanceof InvalidAmountException) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Gets the current exchange rate
   */
  async getCurrentExchangeRate(): Promise<ExchangeRate> {
    return await this.convertUsdToCad['getUsdToCadRate'].execute();
  }
} 